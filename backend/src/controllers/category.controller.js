import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import {ApiError} from "../utils/ApiError.js";

// Create a new category
export const createCategory = asyncHandler(async (req, res) => {
  const { categoryName, description } = req.body;

  if (!categoryName) {
    throw new ApiError(400, "Category name is required");
  }

  const [existingCategory] = await db.query(
    "SELECT * FROM Categories WHERE category_name = ?",
    [categoryName]
  );

  if (existingCategory.length > 0) {
    throw new ApiError(409, "Category already exists");
  }

  await db.query(
    "INSERT INTO Categories (category_name, Description) VALUES (?, ?)",
    [categoryName, description || null]
  );

  res.status(201).json({ message: "Category created successfully" });
});

// Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const [categories] = await db.query(
    "SELECT * FROM Categories ORDER BY category_name ASC"
  );

  res.status(200).json({ categories });
});

// Get a category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [category] = await db.query(
    "SELECT * FROM Categories WHERE CategoryID = ?",
    [id]
  );

  if (category.length === 0) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json({ category: category[0] });
});

// Update a category
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryName, description } = req.body;

  const [category] = await db.query(
    "SELECT * FROM Categories WHERE CategoryID = ?",
    [id]
  );

  if (category.length === 0) {
    throw new ApiError(404, "Category not found");
  }

  await db.query(
    "UPDATE Categories SET category_name = ?, Description = ? WHERE CategoryID = ?",
    [categoryName || category[0].category_name, description || category[0].Description, id]
  );

  res.status(200).json({ message: "Category updated successfully" });
});

// Delete a category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [category] = await db.query(
    "SELECT * FROM Categories WHERE CategoryID = ?",
    [id]
  );

  if (category.length === 0) {
    throw new ApiError(404, "Category not found");
  }

  await db.query("DELETE FROM Categories WHERE CategoryID = ?", [id]);

  res.status(200).json({ message: "Category deleted successfully" });
});
