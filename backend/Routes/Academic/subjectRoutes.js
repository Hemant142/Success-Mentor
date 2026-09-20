import express from "express";
import {
  createSubject,
  deleteSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
} from "../../Controller/Academic/subjectController.js";
import { getSyllabusBySubjectId } from "../../Controller/Academic/syllabusController.js";

const SubjectRoutes = express.Router();

SubjectRoutes.post("/", createSubject);
SubjectRoutes.get("/", getAllSubjects);
SubjectRoutes.get("/:id", getSubjectById);
SubjectRoutes.put("/:id", updateSubject);
SubjectRoutes.delete("/:id", deleteSubject);

SubjectRoutes.get("/:subjectId/syllabus", getSyllabusBySubjectId);
export default SubjectRoutes;
