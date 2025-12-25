import { asyncHandler } from "../utils/asyncHandler.js";
import db from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Report Lost Item
export const reportLostItem = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;
  const { name, description, lost_date, lost_location, category_id } = req.body;

  if (!name || !description || !lost_date || !lost_location || !category_id) {
    throw new ApiError(400, "All fields are required to report a lost item");
  }

  if (!req.files || !req.files.photos || req.files.photos.length === 0) {
    throw new ApiError(400, "At least one photo is required");
  }

  const [result] = await db.query(
    `INSERT INTO lostitems (name, description, lost_date, lost_location, posted_by, category_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, description, lost_date, lost_location, user_id, category_id]
  );

  const lostItemId = result.insertId;

  for (const file of req.files.photos) {
    const uploadResult = await uploadOnCloudinary(file.path);
    await db.query(
      `INSERT INTO lostitemphotos (lost_item_id, photo_url) VALUES (?, ?)`,
      [lostItemId, uploadResult.url]
    );
  }

  res.status(201).json({ message: "Lost item reported successfully", lostItemId });
});

// Get Lost Item by ID (with photos)
// Get Lost Item by ID (with photos and user)
// Utility function to get status from reportedlostfound
const getLostItemStatus = async (lost_item_id) => {
  const [rows] = await db.query(
    `SELECT status FROM reportedlostfound WHERE lost_item_id = ? AND status = 'Returned' LIMIT 1`,
    [lost_item_id]
  );
  return rows.length > 0 ? 'Resolved' : 'Pending';
};

// Get Lost Item by ID
export const getLostItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [items] = await db.query(`
    SELECT l.*, u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number, c.category_name
    FROM lostitems l
    JOIN users u ON l.posted_by = u.user_id
    LEFT JOIN categories c ON l.category_id = c.category_id
    WHERE l.lost_item_id = ?
  `, [id]);

  if (items.length === 0) throw new ApiError(404, "Item not found");

  const [photos] = await db.query(
    `SELECT photo_url FROM lostitemphotos WHERE lost_item_id = ?`,
    [id]
  );

  const item = items[0];
  const status = await getLostItemStatus(item.lost_item_id);

  const formattedItem = {
    ...item,
    status,
    photos: photos.map(p => p.photo_url),
    user: {
      name: item.user_name,
      roll_number: item.roll_number,
      phone_number: item.phone_number,
      hostel: item.hostel,
      room_number: item.room_number
    }
  };

  delete formattedItem.user_name;
  delete formattedItem.roll_number;
  delete formattedItem.phone_number;
  delete formattedItem.hostel;
  delete formattedItem.room_number;

  res.status(200).json({ item: formattedItem });
});

// Get All Lost Items
export const getAllLostItems = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "lost_date",
    sortType = "DESC"
  } = req.query;

  page = Number(page);
  limit = Number(limit);
  const offset = (page - 1) * limit;

  const allowedSortFields = ["lost_date", "name", "lost_location"];
  const allowedSortTypes = ["ASC", "DESC"];

  if (!allowedSortFields.includes(sortBy)) sortBy = "lost_date";
  if (!allowedSortTypes.includes(sortType.toUpperCase())) sortType = "DESC";

  const searchCondition = query
    ? `WHERE l.name LIKE ? OR l.description LIKE ? OR l.lost_location LIKE ?`
    : "";

  const searchParams = query ? [`%${query}%`, `%${query}%`, `%${query}%`] : [];

  const [items] = await db.query(
    `
    SELECT l.*, u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number, c.category_name
    FROM lostitems l
    JOIN users u ON l.posted_by = u.user_id
    LEFT JOIN categories c ON l.category_id = c.category_id
    ${searchCondition}
    ORDER BY ${sortBy} ${sortType}
    LIMIT ? OFFSET ?
    `,
    [...searchParams, limit, offset]
  );

  const lostitems = await Promise.all(items.map(async (item) => {
    const [photos] = await db.query(
      `SELECT photo_url FROM lostitemphotos WHERE lost_item_id = ?`,
      [item.lost_item_id]
    );

    const status = await getLostItemStatus(item.lost_item_id);

    const formattedItem = {
      ...item,
      status,
      photos: photos.map(p => p.photo_url),
      user: {
        name: item.user_name,
        roll_number: item.roll_number,
        phone_number: item.phone_number,
        hostel: item.hostel,
        room_number: item.room_number
      }
    };

    delete formattedItem.user_name;
    delete formattedItem.roll_number;
    delete formattedItem.phone_number;
    delete formattedItem.hostel;
    delete formattedItem.room_number;

    return formattedItem;
  }));

  res.status(200).json({
    success: true,
    message: "Items fetched successfully",
    items: lostitems
  });
});

// Get User's Lost Items
export const getLostItemByUser = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;

  const [items] = await db.query(`
    SELECT l.*, u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number, c.category_name
    FROM lostitems l
    JOIN users u ON l.posted_by = u.user_id
    LEFT JOIN categories c ON l.category_id = c.category_id
    WHERE l.posted_by = ?
    ORDER BY l.lost_date DESC
  `, [user_id]);

  const lostitems = await Promise.all(items.map(async (item) => {
    const [photos] = await db.query(
      `SELECT photo_url FROM lostitemphotos WHERE lost_item_id = ?`,
      [item.lost_item_id]
    );

    const status = await getLostItemStatus(item.lost_item_id);

    const formattedItem = {
      ...item,
      status,
      photos: photos.map(p => p.photo_url),
      user: {
        name: item.user_name,
        roll_number: item.roll_number,
        phone_number: item.phone_number,
        hostel: item.hostel,
        room_number: item.room_number
      }
    };

    delete formattedItem.user_name;
    delete formattedItem.roll_number;
    delete formattedItem.phone_number;
    delete formattedItem.hostel;
    delete formattedItem.room_number;

    return formattedItem;
  }));

  res.status(200).json({ items: lostitems });
});


// Delete Lost Item
export const deleteLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  const [items] = await db.query(`SELECT * FROM lostitems WHERE lost_item_id = ? AND posted_by = ?`, [id, user_id]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");
  
  await db.query(`DELETE FROM reportedlostfound WHERE lost_item_id = ?`, [id]);
  await db.query(`DELETE FROM lostitemphotos WHERE lost_item_id = ?`, [id]);
  await db.query(`DELETE FROM lostitems WHERE lost_item_id = ?`, [id]);
  res.status(200).json({ message: "Lost item deleted successfully" });
});

// Update Lost Item Details (excluding photos)
export const updateLostItemDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;
  const { name, description, lost_date, lost_location, category_id } = req.body;

  const [items] = await db.query(`SELECT * FROM lostitems WHERE lost_item_id = ? AND posted_by = ?`, [id, user_id]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query(
    `UPDATE lostitems SET name = ?, description = ?, lost_date = ?, lost_location = ?, category_id = ? WHERE lost_item_id = ?`,
    [name, description, lost_date, lost_location, category_id, id]
  );

  res.status(200).json({ message: "Lost item details updated successfully" });
});

// Update Lost Item Images
export const updateLostItemImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  const [items] = await db.query(`SELECT * FROM lostitems WHERE lost_item_id = ? AND posted_by = ?`, [id, user_id]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  if (!req.files || !req.files.photos || req.files.photos.length === 0) {
    throw new ApiError(400, "At least one photo is required");
  }

  // First, delete old photos
  await db.query(`DELETE FROM lostitemphotos WHERE lost_item_id = ?`, [id]);

  // Upload new photos
  for (const file of req.files.photos) {
    const uploadResult = await uploadOnCloudinary(file.path);
    await db.query(
      `INSERT INTO lostitemphotos (lost_item_id, photo_url) VALUES (?, ?)`,
      [id, uploadResult.url]
    );
  }

  res.status(200).json({ message: "Lost item images updated successfully" });
});

