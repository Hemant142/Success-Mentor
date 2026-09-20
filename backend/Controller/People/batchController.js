import Batch from "../../Model/People/Batch.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Get All Batches (with optional filters: class_id, class_number, teacher_id)
export const getBatches = async (req, res) => {
  try {
    const { class_id, class_number } = req.query;
    let filter = { status: "ACTIVE" };

    if (class_id) filter.class_id = class_id;
    if (class_number) filter.class_number = Number(class_number);

    // If teacher requesting, filter by teacher
    if (req.user && req.user.role === "TEACHER") {
      filter.teacher_ids = req.user.profile_id;
    }

    const batches = await Batch.find(filter)
      .populate("teacher_ids")
      .populate("student_ids")
      .populate("subject_ids");

    return successResponse(res, batches, "Batches retrieved successfully");
  } catch (err) {
    return errorResponse(res, "Failed to fetch batches", 500, err);
  }
};

// 2. Get Single Batch Details with Student Roster
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("teacher_ids")
      .populate("student_ids")
      .populate("subject_ids");

    if (!batch) {
      return errorResponse(res, "Batch not found", 404);
    }

    return successResponse(res, batch, "Batch retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve batch", 500, err);
  }
};

// 3. Create New Batch
export const createBatch = async (req, res) => {
  try {
    const { name, class_id, class_number, subject_ids, teacher_ids, schedule, monthly_fee, max_capacity } = req.body;

    if (!name || !class_number) {
      return errorResponse(res, "Batch name and class number are required", 400);
    }

    const batch = await Batch.create({
      institute_id: req.user ? req.user.institute_id : null,
      name,
      class_id: class_id || `class_${class_number}`,
      class_number: Number(class_number),
      subject_ids: subject_ids || [],
      teacher_ids: teacher_ids || [],
      schedule: schedule || [],
      monthly_fee: monthly_fee || 2500,
      max_capacity: max_capacity || 25,
      status: "ACTIVE",
    });

    return successResponse(res, batch, "Batch created successfully", 201);
  } catch (err) {
    return errorResponse(res, "Failed to create batch", 500, err);
  }
};

// 4. Update Batch
export const updateBatch = async (req, res) => {
  try {
    const { name, schedule, monthly_fee, max_capacity, teacher_ids, subject_ids, status } = req.body;
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(schedule && { schedule }),
        ...(monthly_fee && { monthly_fee }),
        ...(max_capacity && { max_capacity }),
        ...(teacher_ids && { teacher_ids }),
        ...(subject_ids && { subject_ids }),
        ...(status && { status }),
      },
      { new: true }
    )
      .populate("teacher_ids")
      .populate("student_ids")
      .populate("subject_ids");

    if (!batch) {
      return errorResponse(res, "Batch not found", 404);
    }

    return successResponse(res, batch, "Batch updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update batch", 500, err);
  }
};

// 5. Delete or Archive Batch
export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { status: "ARCHIVED" },
      { new: true }
    );
    if (!batch) {
      return errorResponse(res, "Batch not found", 404);
    }
    return successResponse(res, batch, "Batch archived successfully");
  } catch (err) {
    return errorResponse(res, "Failed to archive batch", 500, err);
  }
};
