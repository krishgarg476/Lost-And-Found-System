import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import {ApiError} from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const reportFoundItem = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;
  const {
    name,
    description,
    found_date,
    found_location,
    pickup_location,
    security_question = "none",
    security_answer_hash = "none",
    category_id
  } = req.body;

  if (
    !name || !description || !found_date || !found_location ||
    !pickup_location || !category_id
  ) {
    throw new ApiError(400, "All fields are required to report a found item");
  }

  if (!req.files || !req.files.photos || req.files.photos.length === 0) {
    throw new ApiError(400, "At least one photo is required");
  }

  // Insert into FoundItems first
  const [result] = await db.query(
    `INSERT INTO FoundItems (name, description, found_date, found_location, pickup_location, security_question, security_answer_hash, posted_by, category_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      found_date,
      found_location,
      pickup_location,
      security_question,
      security_answer_hash,
      user_id,
      category_id
    ]
  );

  const foundItemId = result.insertId; // Get newly created found_item_id
  console.log(foundItemId);
  // Upload photos to Cloudinary and store their URLs into FoundItemPhotos table
  for (const file of req.files.photos) {
    const uploadResult = await uploadOnCloudinary(file.path);

    await db.query(
      `INSERT INTO FoundItemPhotos (found_item_id, photo_url)
       VALUES (?, ?)`,
      [foundItemId, uploadResult.url]
    );
  }

  res.status(201).json({ message: "Found item reported successfully", foundItemId });
});

// Delete Found Item (also delete its photos)
export const deleteFoundItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE found_item_id = ? AND posted_by = ?", [id, user_id]);
  if (items.length === 0) {
    throw new ApiError(404, "Item not found or unauthorized");
  }

  await db.query(`DELETE FROM claims WHERE found_item_id = ?` , [id]);
  // First delete associated photos
  await db.query("DELETE FROM FoundItemPhotos WHERE found_item_id = ?", [id]);

  // Then delete the found item
  await db.query("DELETE FROM FoundItems WHERE found_item_id = ?", [id]);

  res.status(200).json({ message: "Item and its photos deleted successfully" });
});

// Update Found Item Details (excluding photos and pickup_location)
export const updateFoundItemDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;
  const { name, description, found_date, found_location, category_id } = req.body;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE found_item_id = ? AND posted_by = ?", [id, user_id]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query(
    `UPDATE FoundItems SET name = ?, description = ?, found_date = ?, found_location = ?, category_id = ? WHERE found_item_id = ?`,
    [name, description, found_date, found_location, category_id, id]
  );

  res.status(200).json({ message: "Found item details updated successfully" });
});

// Update Found Item Images (delete old + add new)
export const updateFoundItemImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE found_item_id = ? AND posted_by = ?", [id, user_id]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  if (!req.files || !req.files.photos || req.files.photos.length === 0) {
    throw new ApiError(400, "At least one image must be provided");
  }

  // Delete old photos first
  await db.query("DELETE FROM FoundItemPhotos WHERE found_item_id = ?", [id]);

  // Upload and insert new photos
  for (const file of req.files.photos) {
    const result = await uploadOnCloudinary(file.path);

    await db.query(
      `INSERT INTO FoundItemPhotos (found_item_id, photo_url) VALUES (?, ?)`,
      [id, result.url]
    );
  }

  res.status(200).json({ message: "Images updated successfully" });
});

// Update Pickup Location
export const updatePickupPlace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;
  const { pickup_location } = req.body;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE found_item_id = ? AND posted_by = ?", [id, user_id]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query("UPDATE FoundItems SET pickup_location = ? WHERE found_item_id = ?", [pickup_location, id]);

  res.status(200).json({ message: "Pickup location updated successfully" });
});

// Get Found Items Posted by Logged-in User
export const getUserFoundItems = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;

  const [items] = await db.query(
    `SELECT f.*, u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number, c.category_name
     FROM founditems f
     JOIN users u ON f.posted_by = u.user_id
     LEFT JOIN categories c ON f.category_id = c.category_id
     WHERE f.posted_by = ?
     ORDER BY f.found_date DESC`,
    [user_id]
  );

  for (const item of items) {
    const [photos] = await db.query(
      "SELECT photo_url FROM founditemphotos WHERE found_item_id = ?",
      [item.found_item_id]
    );

    const [claims] = await db.query(
      "SELECT 1 FROM claims WHERE found_item_id = ? AND status = 'Approved' LIMIT 1",
      [item.found_item_id]
    );

    item.photos = photos.map(photo => photo.photo_url);
    item.status = claims.length > 0 ? "Resolved" : "Pending";
    item.user = {
      name: item.user_name,
      roll_number: item.roll_number,
      phone_number: item.phone_number,
      hostel: item.hostel,
      room_number: item.room_number,
    };

    delete item.user_name;
    delete item.roll_number;
    delete item.phone_number;
    delete item.hostel;
    delete item.room_number;
  }

  res.status(200).json({ items });
});


// Get Found Item by ID
export const getFoundItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [items] = await db.query(
    `SELECT f.*, u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number, c.category_name
     FROM founditems f
     JOIN users u ON f.posted_by = u.user_id
     LEFT JOIN categories c ON f.category_id = c.category_id
     WHERE f.found_item_id = ?`,
    [id]
  );

  if (items.length === 0) throw new ApiError(404, "Item not found");

  const [photos] = await db.query(
    "SELECT photo_url FROM founditemphotos WHERE found_item_id = ?",
    [id]
  );

  const [claims] = await db.query(
    "SELECT 1 FROM claims WHERE found_item_id = ? AND status = 'Approved' LIMIT 1",
    [id]
  );

  const item = items[0];

  const formattedItem = {
    ...item,
    photos: photos.map(photo => photo.photo_url),
    status: claims.length > 0 ? "Resolved" : "Pending",
    user: {
      name: item.user_name,
      roll_number: item.roll_number,
      phone_number: item.phone_number,
      hostel: item.hostel,
      room_number: item.room_number,
    },
  };

  delete formattedItem.user_name;
  delete formattedItem.roll_number;
  delete formattedItem.phone_number;
  delete formattedItem.hostel;
  delete formattedItem.room_number;

  res.status(200).json({ item: formattedItem });
});


// Get All Found Items with Pagination, Search, and Status
export const getAllFoundItems = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "found_date",
    sortType = "DESC"
  } = req.query;

  page = Number(page);
  limit = Number(limit);
  const offset = (page - 1) * limit;

  const allowedSortFields = ["found_date", "name", "found_location"];
  const allowedSortTypes = ["ASC", "DESC"];

  if (!allowedSortFields.includes(sortBy)) sortBy = "found_date";
  if (!allowedSortTypes.includes(sortType.toUpperCase())) sortType = "DESC";

  const searchCondition = query
    ? `WHERE f.name LIKE ? OR f.description LIKE ? OR f.found_location LIKE ?`
    : "";

  const searchParams = query ? [`%${query}%`, `%${query}%`, `%${query}%`] : [];

  const [items] = await db.query(
    `
    SELECT f.*, u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number, c.category_name
    FROM founditems f
    JOIN users u ON f.posted_by = u.user_id
    LEFT JOIN categories c ON f.category_id = c.category_id
    ${searchCondition}
    ORDER BY ${sortBy} ${sortType}
    LIMIT ? OFFSET ?
    `,
    [...searchParams, limit, offset]
  );

  for (const item of items) {
    const [photos] = await db.query(
      "SELECT photo_url FROM founditemphotos WHERE found_item_id = ?",
      [item.found_item_id]
    );

    const [claims] = await db.query(
      "SELECT 1 FROM claims WHERE found_item_id = ? AND status = 'Approved' LIMIT 1",
      [item.found_item_id]
    );

    item.photos = photos.map(photo => photo.photo_url);
    item.status = claims.length > 0 ? "Resolved" : "Pending";
    item.user = {
      name: item.user_name,
      roll_number: item.roll_number,
      phone_number: item.phone_number,
      hostel: item.hostel,
      room_number: item.room_number,
    };

    delete item.user_name;
    delete item.roll_number;
    delete item.phone_number;
    delete item.hostel;
    delete item.room_number;
  }

  res.status(200).json({
    success: true,
    message: "Found items fetched successfully",
    items
  });
});

// Update Security Question and Answer
export const updateFoundItemSecurityQA = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;
  const { security_question, security_answer_hash } = req.body;

  if (!security_question || !security_answer_hash) {
    throw new ApiError(400, "Both question and answer are required");
  }

  const [items] = await db.query("SELECT * FROM FoundItems WHERE found_item_id = ? AND posted_by = ?", [id, user_id]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query(
    "UPDATE FoundItems SET security_question = ?, security_answer_hash = ? WHERE found_item_id = ?",
    [security_question, security_answer_hash, id]
  );

  res.status(200).json({ message: "Security question and answer updated successfully" });
});


