// routes/user.routes.js
import express from "express";
import {
  registerUser,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfilePic,
  updatePhoneNumber,
  updateHostelAndRoom,
  getDashboardCounts
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Register with profile_pic upload (optional)
router.post("/register", upload.fields([{ name: "profile_pic", maxCount: 1 }]), registerUser);

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);

// Get current user (protected)
router.get("/me", verifyJWT, getCurrentUser);

// Email verification with OTP
router.post("/verify-email", verifyEmail);

// Forgot password (send OTP)
router.post("/forgot-password", forgotPassword);

// Reset password using OTP
router.post("/reset-password", resetPassword);

// Update profile picture
router.patch("/update-profile-pic", verifyJWT, upload.fields([{ name: "profile_pic", maxCount: 1 }]), updateProfilePic);

// Update phone number
router.patch("/update-phone", verifyJWT, updatePhoneNumber);

// Update hostel and room number
router.patch("/update-hostel-room", verifyJWT, updateHostelAndRoom);

router.get("/getDashboardCounts", verifyJWT, getDashboardCounts);

export default router;
