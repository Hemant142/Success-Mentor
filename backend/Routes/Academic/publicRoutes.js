import express from "express";
import {
  getClasses,
  getSubjects,
  getCourseDetails,
  getSyllabusBySubject,
  getTeachers,
  getInstituteInfo,
  submitAdmissionInquiry,
} from "../../Controller/Academic/publicController.js";

const router = express.Router();

router.get("/classes", getClasses);
router.get("/subjects", getSubjects);
router.get("/courses/:id", getCourseDetails);
router.get("/syllabus/:subjectId", getSyllabusBySubject);
router.get("/teachers", getTeachers);
router.get("/institute", getInstituteInfo);
router.post("/enroll", submitAdmissionInquiry);

export default router;
