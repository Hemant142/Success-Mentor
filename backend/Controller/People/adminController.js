import User from "../../Model/People/User.js";
import Student from "../../Model/People/Student.js";
import Parent from "../../Model/People/Parent.js";
import Teacher from "../../Model/People/Teacher.js";
import Batch from "../../Model/People/Batch.js";
import Class from "../../Model/Academic/Class.js";
import Institute from "../../Model/People/Institute.js";
import Attendance from "../../Model/People/Attendance.js";
import Enrollment from "../../Model/Operations/Enrollment.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Get All Enrolled Students Directory (with Parent & Batch details)
export const getAdminStudents = async (req, res) => {
  try {
    const students = await Student.find({ status: "ACTIVE" })
      .populate("parent_id")
      .populate("enrolled_batches")
      .sort({ class_level: 1, name: 1 });

    // Calculate quick attendance percentage for each student
    const studentIds = students.map((s) => s._id);
    const attendanceRecords = await Attendance.find({
      "records.student_id": { $in: studentIds },
    });

    const studentsWithStats = students.map((s) => {
      let totalSessions = 0;
      let presentCount = 0;

      attendanceRecords.forEach((att) => {
        const rec = att.records.find((r) => r.student_id?.toString() === s._id.toString());
        if (rec) {
          totalSessions += 1;
          if (rec.status === "PRESENT" || rec.status === "LATE") {
            presentCount += 1;
          }
        }
      });

      const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

      return {
        ...s.toObject(),
        attendance_percentage: attendancePct,
        total_sessions: totalSessions,
      };
    });

    return successResponse(res, studentsWithStats, "Students directory retrieved successfully");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve students directory", 500, err);
  }
};

// 2. Add / Onboard New Faculty Member
export const createTeacher = async (req, res) => {
  try {
    const { name, email, phone, password, qualifications, specializations, assigned_classes, primary_subject, experience_years, bio, photo_url } = req.body;

    if (!name || !email || !phone) {
      return errorResponse(res, "Name, email, and phone are required", 400);
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "User with this email already exists", 400);
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      password: password || "teacherpassword123",
      role: "TEACHER",
      institute_id: req.user ? req.user.institute_id : null,
      status: "ACTIVE",
    });

    const newTeacher = await Teacher.create({
      user_id: newUser._id,
      institute_id: req.user ? req.user.institute_id : null,
      name,
      email,
      phone,
      qualifications: qualifications || ["B.Ed", "Graduate"],
      specializations: specializations || ["Class 1-5 General"],
      assigned_classes: assigned_classes || [1, 2, 3, 4, 5],
      primary_subject: primary_subject || "Primary Educator",
      experience_years: experience_years || 5,
      rating: 4.9,
      bio: bio || "Experienced educator dedicated to student concept clarity.",
      photo_url: photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    });

    newUser.profile_id = newTeacher._id;
    await newUser.save();

    return successResponse(res, newTeacher, "Teacher onboarded successfully", 201);
  } catch (err) {
    return errorResponse(res, "Failed to onboard teacher", 500, err);
  }
};

// 3. Update Institute Information
export const updateInstitute = async (req, res) => {
  try {
    const { name, tagline, description, contact_email, contact_phone, address } = req.body;
    let institute = await Institute.findOne({ slug: "apex-academy" });

    if (!institute) {
      institute = await Institute.findOne();
    }

    if (name) institute.name = name;
    if (tagline) institute.tagline = tagline;
    if (description) institute.description = description;
    if (contact_email) institute.contact_email = contact_email;
    if (contact_phone) institute.contact_phone = contact_phone;
    if (address) institute.address = { ...institute.address, ...address };

    await institute.save();
    return successResponse(res, institute, "Institute profile updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update institute profile", 500, err);
  }
};

// 4. Manual Direct Student Enrollment (Admin shortcut)
export const manualEnrollStudent = async (req, res) => {
  try {
    const { student_name, student_class, school_name, parent_name, parent_phone, parent_email, parent_address, batch_id } = req.body;

    if (!student_name || !student_class || !parent_name || !parent_phone || !batch_id) {
      return errorResponse(res, "Student name, class, parent details, and batch are required", 400);
    }

    // 1. Find or create Parent User & Profile
    let parentUser = await User.findOne({ phone: parent_phone });
    let parentProfile;

    if (!parentUser) {
      parentUser = await User.create({
        name: parent_name,
        email: parent_email || `parent_${Date.now()}@successmentor.com`,
        phone: parent_phone,
        password: "parentpassword123",
        role: "PARENT",
        institute_id: req.user ? req.user.institute_id : null,
      });

      parentProfile = await Parent.create({
        user_id: parentUser._id,
        institute_id: req.user ? req.user.institute_id : null,
        name: parent_name,
        phone: parent_phone,
        email: parent_email,
        address: parent_address,
        student_ids: [],
      });

      parentUser.profile_id = parentProfile._id;
      await parentUser.save();
    } else {
      parentProfile = await Parent.findOne({ user_id: parentUser._id });
    }

    // 2. Create Student User & Profile
    const studentUser = await User.create({
      name: student_name,
      email: `student_${Date.now()}@successmentor.com`,
      phone: parent_phone,
      password: "studentpassword123",
      role: "STUDENT",
      institute_id: req.user ? req.user.institute_id : null,
    });

    const studentClassNum = Number(student_class);
    const newStudent = await Student.create({
      user_id: studentUser._id,
      institute_id: req.user ? req.user.institute_id : null,
      parent_id: parentProfile ? parentProfile._id : null,
      name: student_name,
      roll_no: `SM-C${studentClassNum}-${Math.floor(1000 + Math.random() * 9000)}`,
      class_id: `class_${studentClassNum}`,
      class_level: studentClassNum,
      school_name: school_name || "CBSE School",
      enrolled_batches: [batch_id],
      status: "ACTIVE",
    });

    studentUser.profile_id = newStudent._id;
    await studentUser.save();

    // 3. Link Student to Parent
    if (parentProfile) {
      parentProfile.student_ids.push(newStudent._id);
      await parentProfile.save();
    }

    // 4. Add Student to Batch
    const batch = await Batch.findById(batch_id);
    if (batch && !batch.student_ids.includes(newStudent._id)) {
      batch.student_ids.push(newStudent._id);
      await batch.save();
    }

    return successResponse(res, newStudent, "Student enrolled successfully into batch", 201);
  } catch (err) {
    return errorResponse(res, "Failed to manually enroll student", 500, err);
  }
};

// 5. Get Comprehensive Admin Overview Stats
export const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: "ACTIVE" });
    const totalTeachers = await Teacher.countDocuments();
    const totalBatches = await Batch.countDocuments({ status: "ACTIVE" });
    const pendingInquiries = await Enrollment.countDocuments({ status: "PENDING" });
    const totalClasses = await Class.countDocuments();

    // Calculate today's attendance stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.find({ date: { $gte: today } });

    let todayTotal = 0;
    let todayPresent = 0;
    todayAttendance.forEach((att) => {
      (att.records || []).forEach((r) => {
        todayTotal += 1;
        if (r.status === "PRESENT" || r.status === "LATE") {
          todayPresent += 1;
        }
      });
    });

    const todayAttendancePct = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 95;

    return successResponse(
      res,
      {
        totalStudents,
        totalTeachers,
        totalBatches,
        pendingInquiries,
        totalClasses,
        todayAttendancePct,
        activeClassrooms: 3,
      },
      "Admin stats retrieved successfully"
    );
  } catch (err) {
    return errorResponse(res, "Failed to retrieve admin stats", 500, err);
  }
};

// 6. Update Student Fee Payment Status
export const updateStudentFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { fee_status, notes } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, "Student not found", 404);
    }

    if (fee_status) student.fee_status = fee_status;
    if (notes !== undefined) student.fee_notes = notes;

    await student.save();
    return successResponse(res, student, "Student fee status updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update student fee status", 500, err);
  }
};

// 7. Update Teacher Details
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, qualifications, specializations, assigned_classes, primary_subject, experience_years, bio, photo_url, rating } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return errorResponse(res, "Teacher not found", 404);
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone) teacher.phone = phone;
    if (primary_subject) teacher.primary_subject = primary_subject;
    if (qualifications) teacher.qualifications = qualifications;
    if (specializations) teacher.specializations = specializations;
    if (assigned_classes) teacher.assigned_classes = assigned_classes;
    if (experience_years !== undefined) teacher.experience_years = Number(experience_years);
    if (bio !== undefined) teacher.bio = bio;
    if (photo_url) teacher.photo_url = photo_url;
    if (rating !== undefined) teacher.rating = Number(rating);

    await teacher.save();

    // Also update matching user record
    if (teacher.user_id) {
      await User.findByIdAndUpdate(teacher.user_id, {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      });
    }

    return successResponse(res, teacher, "Teacher profile updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update teacher", 500, err);
  }
};

// 8. Delete / Remove Teacher
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return errorResponse(res, "Teacher not found", 404);
    }

    if (teacher.user_id) {
      await User.findByIdAndDelete(teacher.user_id);
    }
    await Teacher.findByIdAndDelete(id);

    return successResponse(res, null, "Teacher removed successfully");
  } catch (err) {
    return errorResponse(res, "Failed to remove teacher", 500, err);
  }
};

// 9. Update Student Profile
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roll_no, class_level, school_name, batch_id, fee_status, parent_name, parent_phone } = req.body;

    const student = await Student.findById(id).populate("parent_id");
    if (!student) {
      return errorResponse(res, "Student not found", 404);
    }

    if (name) student.name = name;
    if (roll_no) student.roll_no = roll_no;
    if (class_level) {
      student.class_level = Number(class_level);
      student.class_id = `class_${class_level}`;
    }
    if (school_name) student.school_name = school_name;
    if (fee_status) student.fee_status = fee_status;

    if (batch_id) {
      student.enrolled_batches = [batch_id];
      // Update batch student_ids
      const batch = await Batch.findById(batch_id);
      if (batch && !batch.student_ids.includes(student._id)) {
        batch.student_ids.push(student._id);
        await batch.save();
      }
    }

    await student.save();

    // Update parent if provided
    if (student.parent_id && (parent_name || parent_phone)) {
      await Parent.findByIdAndUpdate(student.parent_id._id, {
        ...(parent_name && { name: parent_name }),
        ...(parent_phone && { phone: parent_phone }),
      });
    }

    return successResponse(res, student, "Student updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update student", 500, err);
  }
};

// 10. Delete / Deactivate Student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, "Student not found", 404);
    }

    student.status = "ARCHIVED";
    await student.save();

    return successResponse(res, null, "Student record archived successfully");
  } catch (err) {
    return errorResponse(res, "Failed to delete student", 500, err);
  }
};

