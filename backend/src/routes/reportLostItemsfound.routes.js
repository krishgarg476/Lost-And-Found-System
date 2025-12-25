// routes/reportLostItemFound.routes.js

import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  reportLostItemFound,
  getItemsReportedByUser,
  getReportsAboutUserLostItems,
  deleteLostItemFound,
  updateReportedLostFoundStatus,
  getItemsById
} from "../controllers/reportLostItemFound.controller.js";

const router = express.Router();

// Route to report a lost item found
router.post("/", verifyJWT, reportLostItemFound);

// Route to get all items reported by the logged-in user (user who found)
router.get("/user/my", verifyJWT, getItemsReportedByUser);

// Route to get all reports about user's own lost items
router.get("/about-user-lost-items", verifyJWT, getReportsAboutUserLostItems);

router.get("/item/:id" ,verifyJWT, getItemsById)
// Route to delete a lost item found report
router.delete("/:id", verifyJWT, deleteLostItemFound);

// Route to update the status of a lost item found report
router.patch("/status/:id", verifyJWT, updateReportedLostFoundStatus);

export default router;
