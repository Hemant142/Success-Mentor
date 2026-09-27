import express from "express";
import {
  markBatchAttendance,
  getBatchAttendance,
  getStudentTodayAttendance,
  getStudentAttendanceSummary,
} from "../../Controller/People/attendanceController.js";
import { protect } from "../../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/mark", protect, markBatchAttendance);
router.get("/batch/:batchId", protect, getBatchAttendance);
router.get("/student/:studentId/today", protect, getStudentTodayAttendance);
router.get("/student/:studentId/summary", protect, getStudentAttendanceSummary);

export default router;
