import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  reportLostItem,
  getLostItemById,
  getAllLostItems,
  getLostItemByUser,
  deleteLostItem,
  updateLostItemDetails,
  updateLostItemImages
} from "../controllers/lost_items.controller.js";

const router = express.Router();

// Report a new lost item
router.post("/report", verifyJWT, upload.fields([{ name: "photos", maxCount: 3 }]), reportLostItem);

// Get a lost item by ID
router.get("/:id", getLostItemById);

// Get all lost items
router.get("/", getAllLostItems);

// Get all lost items posted by logged in user
router.get("/user/me", verifyJWT, getLostItemByUser);

// Delete a lost item
router.delete("/:id", verifyJWT, deleteLostItem);

// Update lost item details
router.put("/update/:id", verifyJWT, updateLostItemDetails);

// Update lost item images
router.put("/update-images/:id", verifyJWT, upload.fields([{ name: "photos", maxCount: 3 }]), updateLostItemImages);

export default router;
