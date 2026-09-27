import React, { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2, Save, Trash2 } from "lucide-react";
import api from "../api/axios";

const EditStudentModal = ({ isOpen, onClose, student, batches = [], onUpdate, onDelete, onStudentUpdated, onStudentDeleted }) => {
  const [formData, setFormData] = useState({
    name: "",
    roll_no: "",
    class_level: 5,
    school_name: "",
    batch_id: "",
    fee_status: "PAID",
    parent_name: "",
    parent_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      const currentBatch = student.enrolled_batches && student.enrolled_batches.length > 0
        ? (student.enrolled_batches[0]._id || student.enrolled_batches[0])
        : "";

      setFormData({
        name: student.name || "",
        roll_no: student.roll_no || "",
        class_level: student.class_level || 5,
        school_name: student.school_name || "",
        batch_id: currentBatch,
        fee_status: student.fee_status || "PAID",
        parent_name: student.parent_id?.name || "",
        parent_phone: student.parent_id?.phone || "",
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const filteredBatches = (batches || []).filter(
    (b) => b?.class_number === Number(formData.class_level)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Student name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        roll_no: formData.roll_no,
        class_level: Number(formData.class_level),
        school_name: formData.school_name,
        batch_id: formData.batch_id,
        fee_status: formData.fee_status,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
      };

      const res = await api.patch(`/admin/students/${student._id}`, payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onUpdate) onUpdate();
          if (onStudentUpdated) onStudentUpdated();
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to archive student "${student.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.delete(`/admin/students/${student._id}`);
      if (res.data.success) {
        if (onDelete) onDelete();
        if (onStudentDeleted) onStudentDeleted();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
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
            <Sparkles size={13} className="text-[#d49539]" /> Students Master Directory
          </div>
          <h2 className="text-2xl font-black text-[#304b62]">Edit Student Profile</h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Update student grade, roll number, assigned batch, parent contact, and fee status.
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
            <h3 className="text-xl font-black text-[#304b62]">Student Profile Updated!</h3>
            <p className="text-slate-500 text-xs">Student record synchronized successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={formData.roll_no}
                  onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Grade / Class
                </label>
                <select
                  value={formData.class_level}
                  onChange={(e) => {
                    const newClass = Number(e.target.value);
                    const matchingBatches = (batches || []).filter((b) => b?.class_number === newClass);
                    setFormData({
                      ...formData,
                      class_level: newClass,
                      batch_id: matchingBatches.length > 0 ? matchingBatches[0]._id : "",
                    });
                  }}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Class {c} (CBSE)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Enrolled Batch
                </label>
                <select
                  value={formData.batch_id}
                  onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white font-medium"
                >
                  <option value="">-- No Batch Assigned --</option>
                  {filteredBatches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fee Payment Status
                </label>
                <select
                  value={formData.fee_status}
                  onChange={(e) => setFormData({ ...formData, fee_status: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white font-bold"
                >
                  <option value="PAID">PAID (Clear)</option>
                  <option value="PENDING">PENDING (Due)</option>
                  <option value="OVERDUE">OVERDUE (Urgent)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Archive Student
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

export default EditStudentModal;
