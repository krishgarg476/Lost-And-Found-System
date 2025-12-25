import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createClaim,
  getClaimsForItem,
  getUserClaims,
  getClaimById,
  updateClaimStatus,
  deleteClaim
} from "../controllers/claims.controller.js";

const router = express.Router();

// Create a new claim
router.post("/create", verifyJWT, createClaim);

// Get claims for a specific found item
router.get("/item/:found_item_id", verifyJWT, getClaimsForItem);

// Get all claims by the current user
router.get("/user/my", verifyJWT, getUserClaims);

// Get claim by ID
router.get("/:id", verifyJWT, getClaimById);

// Update claim status (approve/reject)
router.put("/status/:id", verifyJWT, updateClaimStatus);

// Delete a claim (by the claiming user)
router.delete("/:id", verifyJWT, deleteClaim);

export default router;