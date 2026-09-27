import Parent from "../../Model/People/Parent.js";
import Student from "../../Model/People/Student.js";
import Attendance from "../../Model/People/Attendance.js";
import Result from "../../Model/Academic/Result.js";
import Syllabus from "../../Model/Academic/Syllabus.js";
import Batch from "../../Model/People/Batch.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Get Parent Linked Children with Quick Overview
export const getMyChildren = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user_id: req.user._id }).populate({
      path: "student_ids",
      populate: { path: "enrolled_batches" },
    });

    if (!parent) {
      return errorResponse(res, "Parent profile not found", 404);
    }

    return successResponse(res, parent.student_ids, "Children retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to fetch children", 500, err);
  }
};

// 2. Get Child 360-degree Dashboard Data
export const getChildOverview = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate("enrolled_batches")
      .populate("parent_id");

    if (!student) {
      return errorResponse(res, "Student not found", 404);
    }

    // 1. Today's Attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAtt = await Attendance.findOne({
      date: today,
      "records.student_id": studentId,
    }).populate("batch_id");

    let todayStatus = {
      has_checked_in: false,
      status: "NO_CLASS_OR_NOT_MARKED",
      check_in_time: null,
      topic_covered: null,
      batch_name: null,
    };

    if (todayAtt) {
      const rec = todayAtt.records.find((r) => r.student_id.toString() === studentId.toString());
      todayStatus = {
        has_checked_in: true,
        status: rec ? rec.status : "PRESENT",
        check_in_time: rec ? rec.check_in_time : "N/A",
        topic_covered: todayAtt.topic_covered,
        batch_name: todayAtt.batch_id ? todayAtt.batch_id.name : "Coaching Class",
      };
    }

    // 2. Overall Attendance Rate
    const allAtt = await Attendance.find({ "records.student_id": studentId });
    const totalClasses = allAtt.length;
    let presentCount = 0;
    allAtt.forEach((a) => {
      const rec = a.records.find((r) => r.student_id.toString() === studentId.toString());
      if (rec && (rec.status === "PRESENT" || rec.status === "LATE")) presentCount++;
    });
    const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

    // 3. Subject-wise Syllabus Progress
    const enrolledBatchIds = student.enrolled_batches.map((b) => b._id);
    const batches = await Batch.find({ _id: { $in: enrolledBatchIds } });
    const allSubjectIds = [];
    batches.forEach((b) => allSubjectIds.push(...b.subject_ids));

    const syllabusList = await Syllabus.find({ subject_id: { $in: allSubjectIds } }).populate("subject_id");
    const subjectProgress = syllabusList.map((syl) => {
      let total = 0;
      let completed = 0;
      syl.chapters.forEach((ch) => {
        ch.topics.forEach((tp) => {
          total++;
          if (tp.is_completed) completed++;
        });
      });
      return {
        subject_id: syl.subject_id ? syl.subject_id._id : syl._id,
        subject_name: syl.subject_id ? syl.subject_id.name : "Subject",
        color_code: syl.subject_id ? syl.subject_id.color_code : "#304b62",
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        total_chapters: syl.chapters.length,
        total_topics: total,
        completed_topics: completed,
      };
    });

    // 4. Recent Test Scorecards
    const results = await Result.find({ student_id: studentId })
      .populate({
        path: "exam_id",
        populate: { path: "subject_id" },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const scorecards = results.map((r) => ({
      result_id: r._id,
      title: r.exam_id ? r.exam_id.title : "Unit Test",
      subject_name: r.exam_id && r.exam_id.subject_id ? r.exam_id.subject_id.name : "Subject",
      marks_obtained: r.marks_obtained,
      total_marks: r.exam_id ? r.exam_id.total_marks : 50,
      percentage: r.percentage,
      grade: r.grade,
      teacher_remarks: r.teacher_remarks,
      date: r.exam_id ? r.exam_id.exam_date : r.createdAt,
    }));

    return successResponse(
      res,
      {
        student,
        today_attendance: todayStatus,
        attendance_stats: {
          total_classes: totalClasses,
          present_classes: presentCount,
          attendance_percentage: attendancePercentage,
        },
        subject_progress: subjectProgress,
        recent_tests: scorecards,
      },
      "Child overview dashboard data loaded"
    );
  } catch (err) {
    return errorResponse(res, "Failed to load child overview", 500, err);
  }
};
