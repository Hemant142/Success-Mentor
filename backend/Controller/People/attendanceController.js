import Attendance from "../../Model/People/Attendance.js";
import Student from "../../Model/People/Student.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Mark Batch Attendance (Teacher / Admin)
export const markBatchAttendance = async (req, res) => {
  try {
    const { batch_id, date, subject_id, topic_covered, records } = req.body;

    if (!batch_id || !records || !Array.isArray(records)) {
      return errorResponse(res, "Batch ID and attendance records array are required", 400);
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { batch_id, date: attendanceDate },
      {
        institute_id: req.user ? req.user.institute_id : null,
        batch_id,
        date: attendanceDate,
        subject_id,
        topic_covered: topic_covered || "Regular Class Session",
        records,
        marked_by: req.user ? req.user._id : null,
      },
      { upsert: true, new: true }
    );

    return successResponse(res, attendance, "Batch attendance saved successfully!");
  } catch (err) {
    return errorResponse(res, "Failed to record attendance", 500, err);
  }
};

// 2. Get Batch Attendance History
export const getBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const history = await Attendance.find({ batch_id: batchId })
      .populate("records.student_id")
      .sort({ date: -1 });

    return successResponse(res, history, "Batch attendance history retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to fetch batch attendance history", 500, err);
  }
};

// 3. Get Student Today Check-in Status (For Parent Today Widget)
export const getStudentTodayAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceDoc = await Attendance.findOne({
      date: today,
      "records.student_id": studentId,
    })
      .populate("batch_id")
      .populate("subject_id");

    if (!attendanceDoc) {
      return successResponse(
        res,
        {
          has_checked_in: false,
          status: "NOT_YET_MARKED",
          date: today,
          message: "No attendance logged yet for today",
        },
        "Today's attendance status"
      );
    }

    const record = attendanceDoc.records.find(
      (r) => r.student_id.toString() === studentId.toString()
    );

    return successResponse(
      res,
      {
        has_checked_in: true,
        status: record ? record.status : "PRESENT",
        check_in_time: record ? record.check_in_time : "N/A",
        check_out_time: record ? record.check_out_time : "N/A",
        topic_covered: attendanceDoc.topic_covered,
        batch_name: attendanceDoc.batch_id ? attendanceDoc.batch_id.name : "Coaching Class",
        date: today,
      },
      "Today's live attendance retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to get student today status", 500, err);
  }
};

// 4. Get Comprehensive Student Attendance Summary & History
export const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) {
      return errorResponse(res, "Student not found", 404);
    }

    const allAttendance = await Attendance.find({
      "records.student_id": studentId,
    })
      .populate("batch_id")
      .populate("subject_id")
      .sort({ date: -1 });

    let totalClasses = allAttendance.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    const history = allAttendance.map((att) => {
      const rec = att.records.find((r) => r.student_id.toString() === studentId.toString());
      const st = rec ? rec.status : "PRESENT";
      if (st === "PRESENT") presentCount++;
      else if (st === "ABSENT") absentCount++;
      else if (st === "LATE") {
        lateCount++;
        presentCount++;
      }

      return {
        date: att.date,
        batch_name: att.batch_id ? att.batch_id.name : "Coaching Class",
        topic_covered: att.topic_covered,
        status: st,
        check_in_time: rec ? rec.check_in_time : "",
        check_out_time: rec ? rec.check_out_time : "",
        remarks: rec ? rec.remarks : "",
      };
    });

    const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

    return successResponse(
      res,
      {
        summary: {
          total_classes: totalClasses,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          attendance_percentage: attendanceRate,
        },
        history,
      },
      "Student attendance summary calculated"
    );
  } catch (err) {
    return errorResponse(res, "Failed to fetch student attendance summary", 500, err);
  }
};
