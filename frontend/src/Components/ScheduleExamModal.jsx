import React, { useState } from "react";
import { X, Award, Sparkles } from "lucide-react";
import api from "../api/axios";

const ScheduleExamModal = ({ isOpen, onClose, onSuccess, batches = [], classes = [] }) => {
  const [formData, setFormData] = useState({
    batch_id: "",
    subject_id: "",
    title: "",
    exam_date: new Date().toISOString().split("T")[0],
    total_marks: 50,
    passing_marks: 18,
    syllabus_topics: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const selectedBatch = (batches || []).find((b) => b?._id === formData.batch_id);
  const selectedClass = selectedBatch
    ? (classes || []).find((c) => c?.class_number === selectedBatch.class_number)
    : null;
  const availableSubjects = Array.isArray(selectedClass?.subjects) ? selectedClass.subjects : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.batch_id || !formData.subject_id || !formData.title || !formData.exam_date) {
      setError("Please fill in Batch, Subject, Title, and Exam Date.");
      return;
    }

    setLoading(true);
    try {
      const topicsArray = formData.syllabus_topics
        ? formData.syllabus_topics.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const res = await api.post("/exams", {
        batch_id: formData.batch_id,
        subject_id: formData.subject_id,
        title: formData.title,
        exam_date: formData.exam_date,
        total_marks: Number(formData.total_marks),
        passing_marks: Number(formData.passing_marks),
        syllabus_topics: topicsArray,
      });

      if (res.data.success) {
        onSuccess(res.data.message || "Exam scheduled successfully!");
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#304b62] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d49539] flex items-center justify-center text-white font-bold">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Schedule New Assessment / Test</h3>
              <p className="text-xs text-[#f6d6a0]">Set up a unit test, term exam, or chapter quiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#304b62] mb-1">
              Select Batch <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.batch_id}
              onChange={(e) => {
                const batchId = e.target.value;
                const batch = (batches || []).find((b) => b?._id === batchId);
                const cls = batch ? (classes || []).find((c) => c?.class_number === batch.class_number) : null;
                const firstSub = cls && Array.isArray(cls.subjects) && cls.subjects.length > 0 ? cls.subjects[0]._id : "";
                setFormData({
                  ...formData,
                  batch_id: batchId,
                  subject_id: firstSub,
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
            >
              <option value="">-- Choose Batch --</option>
              {(batches || []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} (Class {b.class_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#304b62] mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
            >
              <option value="">-- Choose Subject --</option>
              {(availableSubjects || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#304b62] mb-1">
              Test Title / Exam Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit Test 1 - Real Numbers & Polynomials"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#304b62] mb-1">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#304b62] mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.total_marks}
                onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#304b62] mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={formData.passing_marks}
                onChange={(e) => setFormData({ ...formData, passing_marks: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#304b62] mb-1">
              Syllabus Topics (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 1, Chapter 2, Factorization"
              value={formData.syllabus_topics}
              onChange={(e) => setFormData({ ...formData, syllabus_topics: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#304b62] hover:bg-[#253b4e] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles size={15} />
              <span>{loading ? "Scheduling..." : "Schedule Assessment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleExamModal;
