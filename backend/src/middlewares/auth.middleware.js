import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import db from "../db/index.js"; // Adjust path based on your structure

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken?.user_id;

        if (!userId) {
            throw new ApiError(401, "Invalid token payload");
        }

        const [rows] = await db.query(
            `SELECT *
             FROM users 
             WHERE user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            throw new ApiError(401, "User not found with given token");
        }

        req.user = rows[0]; // Attach user data to request
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export { verifyJWT };
