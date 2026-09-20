import express from "express";
import {
  getSubjectSyllabus,
  updateTopicCompletion,
  getBatchSyllabusProgress,
} from "../../Controller/Academic/syllabusController.js";
import { protect } from "../../Middleware/authMiddleware.js";

const router = express.Router();

// Get subject syllabus tree (support both /:subjectId and /subject/:subjectId)
router.get("/:subjectId", getSubjectSyllabus);
router.get("/subject/:subjectId", getSubjectSyllabus);

// Update topic progress (support both /:subjectId/topic-progress and /subject/:subjectId/topic)
router.patch("/:subjectId/topic-progress", protect, updateTopicCompletion);
router.patch("/:subjectId/topic", protect, updateTopicCompletion);
router.patch("/subject/:subjectId/topic", protect, updateTopicCompletion);

// Batch progress
router.get("/batch/:batchId/progress", getBatchSyllabusProgress);

export default router;
