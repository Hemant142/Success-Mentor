import express from "express";
import {
  getEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from "../../Controller/Operations/enrollmentController.js";
import { protect } from "../../Middleware/authMiddleware.js";
import { authorize } from "../../Middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("ADMIN", "SUPER_ADMIN"), getEnrollments);
router.patch("/:id/approve", protect, authorize("ADMIN", "SUPER_ADMIN"), approveEnrollment);
router.patch("/:id/reject", protect, authorize("ADMIN", "SUPER_ADMIN"), rejectEnrollment);

export default router;
