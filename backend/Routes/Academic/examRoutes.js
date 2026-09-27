import express from "express";
import {
  createExam,
  getBatchExams,
  submitExamResults,
  getStudentResults,
  getAllExams,
  updateExam,
  deleteExam,
} from "../../Controller/Academic/examController.js";
import { protect } from "../../Middleware/authMiddleware.js";
import { authorize } from "../../Middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllExams);
router.post("/", protect, authorize("ADMIN", "SUPER_ADMIN", "TEACHER"), createExam);
router.patch("/:id", protect, authorize("ADMIN", "SUPER_ADMIN", "TEACHER"), updateExam);
router.delete("/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), deleteExam);
router.get("/batch/:batchId", protect, getBatchExams);
router.post("/:examId/results", protect, submitExamResults);
router.get("/student/:studentId/results", protect, getStudentResults);

export default router;
