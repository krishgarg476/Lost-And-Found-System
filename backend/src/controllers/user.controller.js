import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ApiError} from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, roll_number, phone, hostel, room_number } = req.body;
    if (!name || !email || !password || !roll_number || !phone || !hostel || !room_number) {
      throw new ApiError(400, "All required fields must be filled");
    }
    const [existingUsers] = await db.query(
      "SELECT * FROM Users WHERE email = ? OR roll_number = ?",
      [email, roll_number]
    );
    if (existingUsers.length > 0) {
      throw new ApiError(409, "User already exists with that email or roll number");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePicUrl = null;

    if (req.files && Array.isArray(req.files.profile_pic) && req.files.profile_pic.length > 0) {
      const localPath = req.files.profile_pic[0].path;
      try {
        const cloudinaryResult = await uploadOnCloudinary(localPath);
        profilePicUrl = cloudinaryResult.url;
      } catch {
        throw new ApiError(500, "Error uploading profile picture to cloud storage");
      }
    }

    const [insertResult] = await db.query(
      `INSERT INTO Users (name, email, password_hash, roll_number, phone_number, profile_pic, hostel, room_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, roll_number, phone, profilePicUrl, hostel, room_number]
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `INSERT INTO OTP_Verification (email, otp_code, expires_at) VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    await sendEmail({
      to: email,
      subject: "Verify your email - Lost & Found",
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    });

    res.status(201).json({ message: "User registered. Please verify your email." });
  } catch (error) {
    throw new ApiError(error.status || 500, error.message || "Internal server error");
  }
});

// Login User

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]); // users table is lowercase now

  if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    { user_id: users[0].user_id }, // lowercase field
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set token into HTTP-only cookie
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // cookie secure only in production (https)
    sameSite: 'Strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });

  res.status(200).json({
    message: "Login successful",
    token, // still send token in body (optional)
    user: {
      id: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      roll_number: users[0].roll_number,
      hostel: users[0].hostel,
      room_number: users[0].room_number
    }
  });
});

// Logout User
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({ message: "Logout successful" });
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;
  const [users] = await db.query("SELECT * FROM Users WHERE user_id = ?", [user_id]);

  if (users.length === 0) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    user: {
      id: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      phone: users[0].phone_number,
      roll_number: users[0].roll_number,
      hostel: users[0].hostel,
      room_number: users[0].room_number,
      profile_pic: users[0].profile_pic
    }
  });
});

// Verify Email with OTP
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const [records] = await db.query(
    `SELECT * FROM OTP_Verification WHERE email = ? ORDER BY expires_at DESC LIMIT 1`,
    [email]
  );

  if (records.length === 0 || records[0].otp_code !== otp || new Date(records[0].expires_at) < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await db.query("UPDATE Users SET email_verified = TRUE WHERE email = ?", [email]);

  res.status(200).json({ message: "Email verified successfully" });
});

// Forgot Password (send OTP)
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

  if (users.length === 0) {
    throw new ApiError(404, "User not found with this email");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.query(
    `INSERT INTO OTP_Verification (email, otp_code, expires_at) VALUES (?, ?, ?)`,
    [email, otp, expiresAt]
  );

  await sendEmail({
    to: email,
    subject: "Password Reset OTP - Lost & Found",
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`
  });

  res.status(200).json({ message: "OTP sent to email for password reset" });
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const [records] = await db.query(
    `SELECT * FROM OTP_Verification WHERE email = ? ORDER BY expires_at DESC LIMIT 1`,
    [email]
  );

  if (records.length === 0 || records[0].otp_code !== otp || new Date(records[0].expires_at) < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE Users SET password_hash = ? WHERE email = ?", [hashedPassword, email]);

  res.status(200).json({ message: "Password reset successful" });
});

// Update Profile Picture
export const updateProfilePic = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;

  if (!req.files || !Array.isArray(req.files.profile_pic) || req.files.profile_pic.length === 0) {
    throw new ApiError(400, "Profile picture file is required");
  }

  const localPath = req.files.profile_pic[0].path;

  try {
    const uploadResult = await uploadOnCloudinary(localPath);
    await db.query("UPDATE Users SET profile_pic = ? WHERE user_id = ?", [uploadResult.url, user_id]);
    res.status(200).json({ message: "Profile picture updated", profile_pic: uploadResult.url });
  } catch (error) {
    throw new ApiError(500, "Error uploading image to cloud storage");
  }
});

// Update Phone Number
export const updatePhoneNumber = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;
  const { phone_number } = req.body;

  if (!phone_number) {
    throw new ApiError(400, "Phone number is required");
  }

  await db.query("UPDATE Users SET phone_number = ? WHERE user_id = ?", [phone_number, user_id]);
  res.status(200).json({ message: "Phone number updated" });
});

// Update Hostel and Room Number
export const updateHostelAndRoom = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;
  const { hostel, room_number } = req.body;

  if (!hostel || !room_number) {
    throw new ApiError(400, "Hostel and room number are required");
  }

  await db.query("UPDATE Users SET hostel = ?, room_number = ? WHERE user_id = ?", [hostel, room_number, user_id]);
  res.status(200).json({ message: "Hostel and room number updated" });
});


export const getDashboardCounts = asyncHandler(async (req, res) => {
  const [[{ lost_count }]] = await db.query(`SELECT COUNT(*) AS lost_count FROM lostitems`);
  const [[{ found_count }]] = await db.query(`SELECT COUNT(*) AS found_count FROM founditems`);
  const [[{ user_count }]] = await db.query(`SELECT COUNT(*) AS user_count FROM users`);

  res.status(200).json({
    lost_items: lost_count,
    found_items: found_count,
    users: user_count
  });
});