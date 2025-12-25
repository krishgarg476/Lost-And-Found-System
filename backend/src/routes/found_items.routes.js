// routes/found.routes.js

import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  reportFoundItem,
  deleteFoundItem,
  updateFoundItemDetails,
  updateFoundItemImages,
  updatePickupPlace,
  getUserFoundItems,
  getFoundItemById,
  getAllFoundItems,
  updateFoundItemSecurityQA
} from "../controllers/found_items.controller.js"; 

const router = express.Router();

// Found item routes
router.post("/report", verifyJWT, upload.fields([{ name: "photos", maxCount: 3 }]), reportFoundItem);
router.delete("/:id", verifyJWT, deleteFoundItem);
router.put("/updateDetails/:id", verifyJWT, updateFoundItemDetails);
router.put("/updateImages/:id", verifyJWT, upload.fields([{ name: "photos", maxCount: 3 }]), updateFoundItemImages);
router.put("/updatePickupLocation/:id", verifyJWT, updatePickupPlace);
router.put("/updateSecurityQA/:id", verifyJWT, updateFoundItemSecurityQA);
//get all found items by user
router.get("/mine", verifyJWT, getUserFoundItems);
router.get("/:id", getFoundItemById);
router.get("/", getAllFoundItems);

export default router;
