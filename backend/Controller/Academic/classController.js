import Class from "../../Model/Academic/Class.js";

export const createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.status(200).json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
