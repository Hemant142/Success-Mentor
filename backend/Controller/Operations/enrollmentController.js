import Enrollment from "../../Model/Operations/Enrollment.js";
import Student from "../../Model/People/Student.js";
import Parent from "../../Model/People/Parent.js";
import User from "../../Model/People/User.js";
import Batch from "../../Model/People/Batch.js";
import Institute from "../../Model/People/Institute.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Get All Enrollments
export const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const enrollments = await Enrollment.find(filter)
      .populate("assigned_batch_id")
      .populate("created_student_id")
      .sort({ createdAt: -1 });

    return successResponse(res, enrollments, "Enrollment inquiries retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve enrollments", 500, err);
  }
};

// 2. Approve Enrollment Inquiry & Auto-Provision Student, Parent & Batch Assignment
export const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { batch_id, remarks } = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return errorResponse(res, "Enrollment inquiry not found", 404);
    }

    if (enrollment.status === "APPROVED") {
      return errorResponse(res, "This inquiry has already been approved", 400);
    }

    const institute = (await Institute.findOne()) || { _id: null };

    // 1. Find or Create Parent User & Profile
    let parentUser = await User.findOne({
      $or: [
        { phone: enrollment.parent_phone },
        ...(enrollment.parent_email ? [{ email: enrollment.parent_email.toLowerCase() }] : []),
      ],
    });

    let parentProfile;
    if (!parentUser) {
      const parentEmail = enrollment.parent_email
        ? enrollment.parent_email.toLowerCase().trim()
        : `parent.${enrollment.parent_phone.slice(-6)}@successmentor.com`;

      parentUser = await User.create({
        name: enrollment.parent_name,
        email: parentEmail,
        phone: enrollment.parent_phone,
        password: "parentpassword123", // Default initial password
        role: "PARENT",
        institute_id: institute._id,
        status: "ACTIVE",
      });

      parentProfile = await Parent.create({
        user_id: parentUser._id,
        institute_id: institute._id,
        name: enrollment.parent_name,
        phone: enrollment.parent_phone,
        email: parentEmail,
        address: enrollment.parent_address || "",
        student_ids: [],
      });

      parentUser.profile_id = parentProfile._id;
      await parentUser.save();
    } else {
      parentProfile = await Parent.findOne({ user_id: parentUser._id });
      if (!parentProfile) {
        parentProfile = await Parent.create({
          user_id: parentUser._id,
          institute_id: institute._id,
          name: enrollment.parent_name,
          phone: enrollment.parent_phone,
          student_ids: [],
        });
      }
    }

    // 2. Create Student User & Profile
    const studentCleanName = enrollment.student_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const studentEmail = `student.${studentCleanName}${Date.now().toString().slice(-4)}@successmentor.com`;
    const rollNo = `SM-${new Date().getFullYear()}-${enrollment.student_class.toString().padStart(2, "0")}${Math.floor(100 + Math.random() * 900)}`;

    const studentUser = await User.create({
      name: enrollment.student_name,
      email: studentEmail,
      phone: enrollment.parent_phone,
      password: "studentpassword123",
      role: "STUDENT",
      institute_id: institute._id,
      status: "ACTIVE",
    });

    const studentProfile = await Student.create({
      user_id: studentUser._id,
      institute_id: institute._id,
      parent_id: parentProfile._id,
      name: enrollment.student_name,
      roll_no: rollNo,
      class_id: `class_${enrollment.student_class}`,
      class_level: enrollment.student_class,
      school_name: enrollment.school_name || "CBSE School",
      enrolled_batches: batch_id ? [batch_id] : [],
      status: "ACTIVE",
    });

    studentUser.profile_id = studentProfile._id;
    await studentUser.save();

    // Link Student to Parent profile (multi-child sibling array)
    if (!parentProfile.student_ids.includes(studentProfile._id)) {
      parentProfile.student_ids.push(studentProfile._id);
      await parentProfile.save();
    }

    // 3. Add Student to Batch if batch_id provided
    if (batch_id) {
      await Batch.findByIdAndUpdate(batch_id, {
        $addToSet: { student_ids: studentProfile._id },
      });
    }

    // 4. Update Enrollment status
    enrollment.status = "APPROVED";
    enrollment.assigned_batch_id = batch_id || null;
    enrollment.created_student_id = studentProfile._id;
    enrollment.created_parent_id = parentProfile._id;
    enrollment.remarks = remarks || "Approved and enrolled successfully";
    await enrollment.save();

    return successResponse(
      res,
      {
        enrollment,
        student: studentProfile,
        parent: parentProfile,
        credentials: {
          student_login: studentEmail,
          parent_login: parentUser.email,
          default_password: "password123",
        },
      },
      `Admission approved! Student ${studentProfile.name} (Roll: ${rollNo}) enrolled successfully.`,
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed to approve enrollment", 500, err);
  }
};

// 3. Reject Enrollment Inquiry
export const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      {
        status: "REJECTED",
        rejection_reason: rejection_reason || "Seat unavailable / Batch full",
      },
      { new: true }
    );

    if (!enrollment) {
      return errorResponse(res, "Enrollment inquiry not found", 404);
    }

    return successResponse(res, enrollment, "Inquiry marked as rejected");
  } catch (err) {
    return errorResponse(res, "Failed to reject enrollment", 500, err);
  }
};
