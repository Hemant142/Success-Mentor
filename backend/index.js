import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./Config/db.js";

// Routes
import publicRoutes from "./Routes/Academic/publicRoutes.js";
import authRoutes from "./Routes/People/authRoutes.js";
import enrollmentRoutes from "./Routes/Operations/enrollmentRoutes.js";
import batchRoutes from "./Routes/People/batchRoutes.js";
import attendanceRoutes from "./Routes/People/attendanceRoutes.js";
import syllabusRoutes from "./Routes/Academic/syllabusRoutes.js";
import examRoutes from "./Routes/Academic/examRoutes.js";
import parentRoutes from "./Routes/People/parentRoutes.js";
import adminRoutes from "./Routes/People/adminRoutes.js";

import { errorHandler } from "./Middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root Health Check Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Success-Mentor API v1.0 running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Mounted API Routes
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);

// Fallback error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

// Connect to DB and Start Server
connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Success-Mentor Backend Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
