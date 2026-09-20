import Class from "../../Model/Academic/Class.js";
import Subject from "../../Model/Academic/Subject.js";

export const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubjectsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    console.log(classId, "classId");
    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }
    const subjects = await Subject.find({
      class_id: classId.toString(),
    }).populate("class_id");
    console.log(subjects, "Subjets");
    const formattedSubjects = subjects.map((subject) => ({
      _id: subject._id,
      subject_name: subject.name, // map 'name' to 'subject_name'
      class_name: subject.class_id?.name,
      subject_url: subject.subject_url,
    }));
    res.status(200).json(formattedSubjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate("class_id");
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
