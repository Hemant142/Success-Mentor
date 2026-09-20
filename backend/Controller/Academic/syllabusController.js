import Syllabus from "../../Model/Academic/Syllabus.js";
import Subject from "../../Model/Academic/Subject.js";
import Batch from "../../Model/People/Batch.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

// 1. Get Full Syllabus Tree with Metrics
export const getSubjectSyllabus = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const syllabus = await Syllabus.findOne({ subject_id: subjectId }).populate("subject_id");

    if (!syllabus) {
      return errorResponse(res, "Syllabus not found for this subject", 404);
    }

    let totalTopics = 0;
    let completedTopics = 0;

    syllabus.chapters.forEach((chap) => {
      chap.topics.forEach((top) => {
        totalTopics++;
        if (top.is_completed) completedTopics++;
      });
    });

    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return successResponse(
      res,
      {
        syllabus,
        metrics: {
          total_chapters: syllabus.chapters.length,
          total_topics: totalTopics,
          completed_topics: completedTopics,
          completion_percentage: completionPercentage,
        },
      },
      "Syllabus retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to fetch syllabus", 500, err);
  }
};

// 2. Toggle Topic Completion (Teacher / Admin)
export const updateTopicCompletion = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { chapterNumber, topicId, topicName, is_completed } = req.body;

    const syllabus = await Syllabus.findOne({ subject_id: subjectId });
    if (!syllabus) {
      return errorResponse(res, "Syllabus not found", 404);
    }

    let updated = false;

    for (const chapter of syllabus.chapters) {
      if (chapterNumber === undefined || chapter.number === Number(chapterNumber)) {
        for (const topic of chapter.topics) {
          if (
            (topicId && topic.topic_id === topicId) ||
            (topicName && topic.name.toLowerCase() === topicName.toLowerCase()) ||
            topic._id.toString() === topicId
          ) {
            topic.is_completed = is_completed !== undefined ? Boolean(is_completed) : !topic.is_completed;
            topic.completed_at = topic.is_completed ? new Date() : null;
            topic.completed_by = req.user ? req.user._id : null;
            updated = true;
            break;
          }
        }
      }
      if (updated) break;
    }

    if (!updated) {
      return errorResponse(res, "Topic not found in syllabus", 404);
    }

    await syllabus.save();

    // Recompute overall percentage
    let totalTopics = 0;
    let completedTopics = 0;
    syllabus.chapters.forEach((chap) => {
      chap.topics.forEach((top) => {
        totalTopics++;
        if (top.is_completed) completedTopics++;
      });
    });
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return successResponse(
      res,
      {
        syllabus,
        completion_percentage: completionPercentage,
        completed_topics: completedTopics,
        total_topics: totalTopics,
      },
      "Topic progress updated successfully!"
    );
  } catch (err) {
    return errorResponse(res, "Failed to update topic progress", 500, err);
  }
};

// 3. Get Batch Syllabus Progress for All Subjects
export const getBatchSyllabusProgress = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return errorResponse(res, "Batch not found", 404);
    }

    const syllabusDocs = await Syllabus.find({
      subject_id: { $in: batch.subject_ids },
    }).populate("subject_id");

    const progressList = syllabusDocs.map((syl) => {
      let totalTopics = 0;
      let completedTopics = 0;
      syl.chapters.forEach((chap) => {
        chap.topics.forEach((top) => {
          totalTopics++;
          if (top.is_completed) completedTopics++;
        });
      });
      const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        subject_id: syl.subject_id._id,
        subject_name: syl.subject_id.name,
        color_code: syl.subject_id.color_code,
        total_chapters: syl.chapters.length,
        total_topics: totalTopics,
        completed_topics: completedTopics,
        percentage: pct,
      };
    });

    return successResponse(res, progressList, "Batch subject progress calculated");
  } catch (err) {
    return errorResponse(res, "Failed to fetch batch progress", 500, err);
  }
};
