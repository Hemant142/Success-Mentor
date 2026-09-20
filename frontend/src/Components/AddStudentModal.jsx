import React, { useState } from "react";
import { X, UserPlus, Sparkles } from "lucide-react";
import api from "../api/axios";

const AddStudentModal = ({ isOpen, onClose, onSuccess, batches = [] }) => {
  const [formData, setFormData] = useState({
    student_name: "",
    student_class: 5,
    batch_id: "",
    school_name: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    parent_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const filteredBatches = (batches || []).filter(
    (b) => b?.class_number === Number(formData.student_class)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.student_name || !formData.parent_name || !formData.parent_phone || !formData.batch_id) {
      setError("Please fill in all mandatory fields (Student Name, Class, Batch, Parent Name & Phone).");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/admin/enroll-student", {
        ...formData,
        student_class: Number(formData.student_class),
      });

      if (res.data.success) {
        onSuccess(res.data.message || "Student enrolled successfully!");
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll student. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#304b62] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d49539] flex items-center justify-center text-white font-bold">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Direct Student Admission</h3>
              <p className="text-xs text-[#f6d6a0]">Manual student registration & batch enrollment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Section: Student Profile */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d49539] block mb-2">
              1. Student Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Sharma"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  Grade / Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.student_class}
                  onChange={(e) => {
                    const newClass = Number(e.target.value);
                    const matchingBatches = batches.filter((b) => b.class_number === newClass);
                    setFormData({
                      ...formData,
                      student_class: newClass,
                      batch_id: matchingBatches.length > 0 ? matchingBatches[0]._id : "",
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Class {c} (CBSE)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  Target Batch <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.batch_id}
                  onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
                >
                  <option value="">-- Select Enrolled Batch --</option>
                  {filteredBatches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.student_ids?.length || 0}/{b.max_capacity || 25} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Public School"
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Parent / Guardian Info */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d49539] block mb-2">
              2. Parent & Guardian Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  Parent / Guardian Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  Parent Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rajesh.sharma@example.com"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 14, Main Market, City"
                  value={formData.parent_address}
                  onChange={(e) => setFormData({ ...formData, parent_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>
            </div>
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
              <span>{loading ? "Registering..." : "Confirm Admission"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
