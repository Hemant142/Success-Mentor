import express from "express";
import {
  createClass,
  deleteClass,
  getAllClasses,
  getClassById,
  updateClass,
} from "../../Controller/Academic/classController.js";
import { getSubjectsByClassId } from "../../Controller/Academic/subjectController.js";

const ClassRoutes = express.Router();

ClassRoutes.post("/", createClass);
ClassRoutes.get("/", getAllClasses);
ClassRoutes.get("/:classId/subjects", getSubjectsByClassId);
ClassRoutes.get("/:id", getClassById);
ClassRoutes.put("/:id", updateClass);
ClassRoutes.delete("/:id", deleteClass);

export default ClassRoutes;
