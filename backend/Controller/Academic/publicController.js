import Class from "../../Model/Academic/Class.js";
import Subject from "../../Model/Academic/Subject.js";
import Syllabus from "../../Model/Academic/Syllabus.js";
import Teacher from "../../Model/People/Teacher.js";
import Institute from "../../Model/People/Institute.js";
import Enrollment from "../../Model/Operations/Enrollment.js";
import Batch from "../../Model/People/Batch.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Get All Classes (Classes 1 to 10) with Syllabus Progress & Assigned Teachers
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ class_number: 1 }).lean();
    const subjects = await Subject.find().lean();
    const syllabusList = await Syllabus.find().lean();
    const teachers = await Teacher.find().lean();

    const enhancedClasses = classes.map((cls) => {
      const clsSubjects = subjects.filter(
        (s) => s.class_id === cls._id || s.class_id?.toString() === cls._id
      );
      const subjIds = clsSubjects.map((s) => s._id);
      const clsSyllabus = syllabusList.filter((syl) => subjIds.includes(syl.subject_id));

      let totalTopics = 0;
      let completedTopics = 0;
      let totalChapters = 0;
      let completedChapters = 0;

      clsSyllabus.forEach((syl) => {
        (syl.chapters || []).forEach((ch) => {
          totalChapters += 1;
          const chTopics = ch.topics || [];
          totalTopics += chTopics.length;
          const chDone = chTopics.filter((t) => t.is_completed).length;
          completedTopics += chDone;
          if (chTopics.length > 0 && chDone === chTopics.length) {
            completedChapters += 1;
          }
        });
      });

      const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      const assignedTeachers = teachers.filter(
        (t) =>
          (t.assigned_classes && t.assigned_classes.includes(cls.class_number)) ||
          (t.specializations && t.specializations.some((s) => s.includes(`Class ${cls.class_number}`)))
      );

      return {
        ...cls,
        subjects: clsSubjects,
        subject_count: clsSubjects.length,
        total_chapters: totalChapters,
        completed_chapters: completedChapters,
        total_topics: totalTopics,
        completed_topics: completedTopics,
        syllabus_progress_pct: progressPct,
        assigned_teachers: assignedTeachers.map((t) => ({
          _id: t._id,
          name: t.name,
          photo_url: t.photo_url,
          primary_subject: t.primary_subject,
          specializations: t.specializations,
          experience_years: t.experience_years,
          rating: t.rating || 4.8,
        })),
      };
    });

    return successResponse(res, enhancedClasses, "Classes fetched successfully");
  } catch (err) {
    return errorResponse(res, "Failed to fetch classes", 500, err);
  }
};

// 2. Get Subjects (Optionally filter by class_id)
export const getSubjects = async (req, res) => {
  try {
    const { class_id } = req.query;
    const filter = class_id ? { class_id } : {};
    const subjects = await Subject.find(filter).populate("class_id");
    return successResponse(res, subjects, "Subjects fetched successfully");
  } catch (err) {
    return errorResponse(res, "Failed to fetch subjects", 500, err);
  }
};

// 3. Get Course/Class Detail with Subjects, Detailed Chapter Status & Syllabus Progress
export const getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params; // e.g. "class_10" or Class ID
    const classDoc = await Class.findOne({ $or: [{ _id: id }, { class_number: Number(id) || -1 }] });
    if (!classDoc) {
      return errorResponse(res, "Class not found", 404);
    }

    const subjects = await Subject.find({ class_id: classDoc._id });
    const subjectIds = subjects.map((s) => s._id);
    const syllabusList = await Syllabus.find({ subject_id: { $in: subjectIds } });

    let overallTotalTopics = 0;
    let overallCompletedTopics = 0;

    // Attach syllabus with detailed progress to subjects
    const subjectsWithSyllabus = subjects.map((subj) => {
      const syl = syllabusList.find((s) => s.subject_id === subj._id);
      const rawChapters = syl ? syl.chapters : [];

      const chapters = rawChapters.map((ch) => {
        const topics = ch.topics || [];
        const completedCount = topics.filter((t) => t.is_completed).length;
        const totalCount = topics.length;
        let status = "UPCOMING";
        if (totalCount > 0 && completedCount === totalCount) {
          status = "COMPLETED";
        } else if (completedCount > 0) {
          status = "IN_PROGRESS";
        }

        overallTotalTopics += totalCount;
        overallCompletedTopics += completedCount;

        const chObj = ch.toObject ? ch.toObject() : ch;
        return {
          ...chObj,
          status,
          total_topics_count: totalCount,
          completed_topics_count: completedCount,
          progress_pct: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        };
      });

      const subjTotalTopics = chapters.reduce((acc, c) => acc + (c.total_topics_count || 0), 0);
      const subjCompletedTopics = chapters.reduce((acc, c) => acc + (c.completed_topics_count || 0), 0);
      const subjProgressPct = subjTotalTopics > 0 ? Math.round((subjCompletedTopics / subjTotalTopics) * 100) : 0;
      const completedChaptersCount = chapters.filter((c) => c.status === "COMPLETED").length;
      const inProgressChaptersCount = chapters.filter((c) => c.status === "IN_PROGRESS").length;

      return {
        ...subj.toObject(),
        total_chapters: chapters.length,
        completed_chapters: completedChaptersCount,
        in_progress_chapters: inProgressChaptersCount,
        total_topics: subjTotalTopics,
        completed_topics: subjCompletedTopics,
        progress_pct: subjProgressPct,
        syllabus: chapters,
      };
    });

    const batches = await Batch.find({ class_id: classDoc._id, status: "ACTIVE" }).populate("teacher_ids");

    // Find assigned teachers for this class
    const teachers = await Teacher.find({
      $or: [
        { assigned_classes: classDoc.class_number },
        { specializations: { $regex: new RegExp(`Class.*${classDoc.class_number}`, "i") } },
      ],
    });

    const overallClassProgress =
      overallTotalTopics > 0 ? Math.round((overallCompletedTopics / overallTotalTopics) * 100) : 0;

    return successResponse(
      res,
      {
        class: {
          ...classDoc.toObject(),
          overall_progress_pct: overallClassProgress,
          total_topics: overallTotalTopics,
          completed_topics: overallCompletedTopics,
        },
        subjects: subjectsWithSyllabus,
        batches,
        assigned_teachers: teachers,
      },
      "Course details fetched successfully"
    );
  } catch (err) {
    return errorResponse(res, "Failed to fetch course details", 500, err);
  }
};

// 4. Get Syllabus for a Specific Subject
export const getSyllabusBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const syllabus = await Syllabus.findOne({ subject_id: subjectId }).populate("subject_id");
    if (!syllabus) {
      return errorResponse(res, "Syllabus not found for this subject", 404);
    }
    return successResponse(res, syllabus, "Syllabus fetched successfully");
  } catch (err) {
    return errorResponse(res, "Failed to fetch syllabus", 500, err);
  }
};

// 5. Get Teachers Directory
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    return successResponse(res, teachers, "Teachers fetched successfully");
  } catch (err) {
    return errorResponse(res, "Failed to fetch teachers", 500, err);
  }
};

// 6. Get Public Institute Profile & Stats
export const getInstituteInfo = async (req, res) => {
  try {
    const institute = await Institute.findOne({ slug: "apex-academy" });
    const totalClasses = await Class.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalBatches = await Batch.countDocuments({ status: "ACTIVE" });

    return successResponse(
      res,
      {
        institute,
        stats: {
          totalClasses,
          totalTeachers,
          totalBatches,
        },
      },
      "Institute info fetched successfully"
    );
  } catch (err) {
    return errorResponse(res, "Failed to fetch institute info", 500, err);
  }
};

// 7. Submit Public Admission Inquiry
export const submitAdmissionInquiry = async (req, res) => {
  try {
    const {
      parent_name,
      parent_phone,
      parent_email,
      parent_address,
      student_name,
      student_class,
      school_name,
      subjects_interested,
      preferred_batch_timing,
      remarks,
    } = req.body;

    if (!parent_name || !parent_phone || !student_name || !student_class) {
      return errorResponse(
        res,
        "Parent name, phone, student name, and target class are required.",
        400
      );
    }

    const institute = await Institute.findOne();

    const enrollment = await Enrollment.create({
      institute_id: institute ? institute._id : null,
      parent_name,
      parent_phone,
      parent_email,
      parent_address,
      student_name,
      student_class: Number(student_class),
      school_name,
      subjects_interested: subjects_interested || [],
      preferred_batch_timing: preferred_batch_timing || "EVENING",
      remarks,
      status: "PENDING",
    });

    return successResponse(
      res,
      {
        inquiry_id: enrollment._id,
        status: enrollment.status,
        student_name: enrollment.student_name,
        target_class: enrollment.student_class,
      },
      "Admission inquiry submitted successfully! Our counseling team will reach out shortly.",
      201
    );
  } catch (err) {
    return errorResponse(res, "Failed to submit admission inquiry", 500, err);
  }
};
