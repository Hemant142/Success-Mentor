import express from "express";
import {
  getAdminStudents,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  updateInstitute,
  manualEnrollStudent,
  updateStudent,
  deleteStudent,
  getAdminStats,
  updateStudentFeeStatus,
} from "../../Controller/People/adminController.js";
import { protect } from "../../Middleware/authMiddleware.js";
import { authorize } from "../../Middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("ADMIN", "SUPER_ADMIN"));

router.get("/stats", getAdminStats);
router.get("/students", getAdminStudents);
router.patch("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);
router.patch("/students/:id/fee", updateStudentFeeStatus);

router.post("/teachers", createTeacher);
router.patch("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

router.patch("/institute", updateInstitute);
router.post("/enroll-student", manualEnrollStudent);

export default router;
