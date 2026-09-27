import Exam from "../../Model/Academic/Exam.js";
import Result from "../../Model/Academic/Result.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Create Exam (Teacher / Admin)
export const createExam = async (req, res) => {
  try {
    const { batch_id, subject_id, title, exam_date, total_marks, passing_marks, syllabus_topics } = req.body;

    if (!batch_id || !subject_id || !title || !exam_date) {
      return errorResponse(res, "Batch, subject, title, and exam date are required", 400);
    }

    const exam = await Exam.create({
      institute_id: req.user ? req.user.institute_id : null,
      batch_id,
      subject_id,
      title,
      exam_date: new Date(exam_date),
      total_marks: total_marks || 50,
      passing_marks: passing_marks || 18,
      syllabus_topics: syllabus_topics || [],
      status: "UPCOMING",
      created_by: req.user ? req.user._id : null,
    });

    return successResponse(res, exam, "Exam created successfully", 201);
  } catch (err) {
    return errorResponse(res, "Failed to create exam", 500, err);
  }
};

// 2. Get Exams for Batch
export const getBatchExams = async (req, res) => {
  try {
    const { batchId } = req.params;
    const exams = await Exam.find({ batch_id: batchId })
      .populate("subject_id")
      .sort({ exam_date: -1 });

    return successResponse(res, exams, "Exams retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to fetch exams", 500, err);
  }
};

// 3. Submit / Bulk Save Exam Results (Teacher)
export const submitExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // array of { student_id, marks_obtained, is_absent, remarks }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return errorResponse(res, "Exam not found", 404);
    }

    if (!results || !Array.isArray(results)) {
      return errorResponse(res, "Results array is required", 400);
    }

    const savedResults = [];

    for (const r of results) {
      const marks = Number(r.marks_obtained) || 0;
      const isAbsent = Boolean(r.is_absent);
      const percentage = !isAbsent && exam.total_marks > 0 ? Math.round((marks / exam.total_marks) * 100) : 0;
      
      let grade = "F";
      if (!isAbsent) {
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B+";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 50) grade = "C";
        else if (percentage >= 35) grade = "D";
      }

      const resultDoc = await Result.findOneAndUpdate(
        { exam_id: examId, student_id: r.student_id },
        {
          exam_id: examId,
          student_id: r.student_id,
          marks_obtained: marks,
          is_absent: isAbsent,
          percentage,
          grade,
          teacher_remarks: r.remarks || "",
          marked_by: req.user ? req.user._id : null,
        },
        { upsert: true, new: true }
      );
      savedResults.push(resultDoc);
    }

    // Update exam status to PUBLISHED
    exam.status = "PUBLISHED";
    await exam.save();

    return successResponse(res, savedResults, "Results saved and published successfully!");
  } catch (err) {
    return errorResponse(res, "Failed to save results", 500, err);
  }
};

// 4. Get Student Results History & Scorecards (Parent / Student)
export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await Result.find({ student_id: studentId })
      .populate({
        path: "exam_id",
        populate: { path: "subject_id" },
      })
      .sort({ createdAt: -1 });

    const formattedScorecards = results.map((r) => {
      const exam = r.exam_id;
      return {
        result_id: r._id,
        exam_id: exam ? exam._id : null,
        title: exam ? exam.title : "Unit Test",
        subject_name: exam && exam.subject_id ? exam.subject_id.name : "Subject",
        exam_date: exam ? exam.exam_date : null,
        total_marks: exam ? exam.total_marks : 50,
        passing_marks: exam ? exam.passing_marks : 18,
        marks_obtained: r.marks_obtained,
        is_absent: r.is_absent,
        percentage: r.percentage,
        grade: r.grade,
        teacher_remarks: r.teacher_remarks,
      };
    });

    return successResponse(res, formattedScorecards, "Student scorecards retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to fetch student results", 500, err);
  }
};

// 5. Get All Exams (Admin / General View)
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("batch_id")
      .populate("subject_id")
      .sort({ exam_date: -1 });

    return successResponse(res, exams, "All exams retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to fetch exams", 500, err);
  }
};

// 6. Update Exam
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, exam_date, total_marks, passing_marks, syllabus_topics, status } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(exam_date && { exam_date: new Date(exam_date) }),
        ...(total_marks !== undefined && { total_marks: Number(total_marks) }),
        ...(passing_marks !== undefined && { passing_marks: Number(passing_marks) }),
        ...(syllabus_topics && { syllabus_topics }),
        ...(status && { status }),
      },
      { new: true }
    )
      .populate("batch_id")
      .populate("subject_id");

    if (!exam) {
      return errorResponse(res, "Exam not found", 404);
    }

    return successResponse(res, exam, "Exam updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update exam", 500, err);
  }
};

// 7. Delete Exam
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) {
      return errorResponse(res, "Exam not found", 404);
    }
    await Result.deleteMany({ exam_id: id });
    return successResponse(res, null, "Exam and associated results deleted successfully");
  } catch (err) {
    return errorResponse(res, "Failed to delete exam", 500, err);
  }
};

