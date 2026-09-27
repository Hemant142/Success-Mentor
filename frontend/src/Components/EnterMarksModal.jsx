import React, { useState, useEffect } from "react";
import { X, Award, Save } from "lucide-react";
import api from "../api/axios";

const EnterMarksModal = ({ isOpen, onClose, onSuccess, exam, batchStudents = [] }) => {
  const [resultsList, setResultsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (exam && Array.isArray(batchStudents) && batchStudents.length > 0) {
      const initial = batchStudents.map((student) => ({
        student_id: student?._id,
        student_name: student?.name || "Student",
        roll_no: student?.roll_no || "N/A",
        marks_obtained: "",
        is_absent: false,
        remarks: "Good effort",
      }));
      setResultsList(initial);
    }
  }, [exam, batchStudents]);

  if (!isOpen || !exam) return null;

  const handleScoreChange = (index, val) => {
    const updated = [...resultsList];
    const num = Math.min(Math.max(0, Number(val) || 0), exam.total_marks || 50);
    updated[index].marks_obtained = num;
    setResultsList(updated);
  };

  const handleAbsentToggle = (index) => {
    const updated = [...resultsList];
    updated[index].is_absent = !updated[index].is_absent;
    if (updated[index].is_absent) {
      updated[index].marks_obtained = 0;
      updated[index].remarks = "Absent from assessment";
    }
    setResultsList(updated);
  };

  const handleRemarkChange = (index, text) => {
    const updated = [...resultsList];
    updated[index].remarks = text;
    setResultsList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = resultsList.map((r) => ({
        student_id: r.student_id,
        marks_obtained: r.is_absent ? 0 : Number(r.marks_obtained) || 0,
        is_absent: r.is_absent,
        remarks: r.remarks,
      }));

      const res = await api.post(`/exams/${exam._id}/results`, { results: payload });
      if (res.data.success) {
        onSuccess("Exam scorecards published and saved successfully!");
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit marks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#304b62] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d49539] flex items-center justify-center text-white font-bold">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Enter Marks & Publish Results</h3>
              <p className="text-xs text-[#f6d6a0]">
                {exam.title} • Total Marks: {exam.total_marks} • Pass: {exam.passing_marks}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Table */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-[#304b62] font-black border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3 text-center">Absent?</th>
                  <th className="p-3">Marks (/{exam.total_marks})</th>
                  <th className="p-3">Grade Est.</th>
                  <th className="p-3">Feedback / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resultsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500 font-medium">
                      No enrolled students found in this batch.
                    </td>
                  </tr>
                ) : (
                  resultsList.map((item, idx) => {
                    const score = Number(item.marks_obtained) || 0;
                    const pct = exam.total_marks > 0 ? Math.round((score / exam.total_marks) * 100) : 0;
                    let grade = "F";
                    if (!item.is_absent) {
                      if (pct >= 90) grade = "A+";
                      else if (pct >= 80) grade = "A";
                      else if (pct >= 70) grade = "B+";
                      else if (pct >= 60) grade = "B";
                      else if (pct >= 50) grade = "C";
                      else if (pct >= 35) grade = "D";
                    }

                    return (
                      <tr key={item.student_id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-bold text-[#304b62]">{item.student_name}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{item.roll_no}</td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.is_absent}
                            onChange={() => handleAbsentToggle(idx)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            disabled={item.is_absent}
                            min="0"
                            max={exam.total_marks}
                            value={item.marks_obtained}
                            placeholder="0"
                            onChange={(e) => handleScoreChange(idx, e.target.value)}
                            className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none disabled:bg-slate-100 disabled:opacity-50"
                          />
                        </td>
                        <td className="p-3">
                          {item.is_absent ? (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              ABSENT
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                grade.startsWith("A")
                                  ? "bg-emerald-100 text-emerald-800"
                                  : grade.startsWith("B")
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {grade} ({pct}%)
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleRemarkChange(idx, e.target.value)}
                            placeholder="e.g. Excellent conceptual clarity"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
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
              disabled={loading || resultsList.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Save size={15} />
              <span>{loading ? "Saving Results..." : "Publish Scorecards"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterMarksModal;
