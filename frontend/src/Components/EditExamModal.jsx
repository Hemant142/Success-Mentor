import React, { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2, Save, Trash2 } from "lucide-react";
import api from "../api/axios";

const EditExamModal = ({ isOpen, onClose, exam, onUpdate, onDelete, onExamUpdated, onExamDeleted }) => {
  const [formData, setFormData] = useState({
    title: "",
    exam_date: "",
    total_marks: 50,
    passing_marks: 18,
    syllabus_topics: "",
    status: "UPCOMING",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title || "",
        exam_date: exam.exam_date ? new Date(exam.exam_date).toISOString().split("T")[0] : "",
        total_marks: exam.total_marks || 50,
        passing_marks: exam.passing_marks || 18,
        syllabus_topics: Array.isArray(exam.syllabus_topics) ? exam.syllabus_topics.join(", ") : "",
        status: exam.status || "UPCOMING",
      });
    }
  }, [exam]);

  if (!isOpen || !exam) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.exam_date) {
      setError("Title and Exam Date are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const topicsArray = formData.syllabus_topics
        ? formData.syllabus_topics.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        exam_date: formData.exam_date,
        total_marks: Number(formData.total_marks),
        passing_marks: Number(formData.passing_marks),
        syllabus_topics: topicsArray,
        status: formData.status,
      };

      const res = await api.patch(`/exams/${exam._id}`, payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onUpdate) onUpdate();
          if (onExamUpdated) onExamUpdated();
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete test "${exam.title}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.delete(`/exams/${exam._id}`);
      if (res.data.success) {
        if (onDelete) onDelete();
        if (onExamDeleted) onExamDeleted();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="space-y-1 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 bg-[#d49539]/15 text-[#304b62] px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles size={13} className="text-[#d49539]" /> Exams & Assessments
          </div>
          <h2 className="text-2xl font-black text-[#304b62]">Edit Assessment Details</h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Update test schedule, max marks, passing threshold, and syllabus topics.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-[#304b62]">Assessment Updated!</h3>
            <p className="text-slate-500 text-xs">Updated exam details have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Test Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.exam_date}
                  onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Passing Marks
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formData.passing_marks}
                  onChange={(e) => setFormData({ ...formData, passing_marks: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Syllabus Topics (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.syllabus_topics}
                onChange={(e) => setFormData({ ...formData, syllabus_topics: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete Test
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#304b62] hover:bg-[#253b4e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save size={14} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditExamModal;
