import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

// Create a new category (protected)
router.post("/categories", verifyJWT, createCategory);

// Get all categories (public)
router.get("/categories", getAllCategories);

// Get category by ID (public)
router.get("/categories/:id", getCategoryById);

// Update category (protected)
router.patch("/categories/:id", verifyJWT, updateCategory);

// Delete category (protected)
router.delete("/categories/:id", verifyJWT, deleteCategory);

export default router;
