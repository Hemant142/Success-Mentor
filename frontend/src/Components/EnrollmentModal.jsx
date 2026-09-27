import React, { useState } from "react";
import { X, CheckCircle2, Send, School, Phone, Mail, User, BookOpen, Clock } from "lucide-react";
import api from "../api/axios";

const EnrollmentModal = ({ isOpen, onClose, preselectedClass = 10, preselectedCourse = "" }) => {
  const [formData, setFormData] = useState({
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    parent_address: "",
    student_name: "",
    student_class: preselectedClass || 10,
    school_name: "",
    preferred_batch_timing: "EVENING",
    remarks: preselectedCourse ? `Interested in ${preselectedCourse}` : "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.parent_name || !formData.parent_phone || !formData.student_name || !formData.student_class) {
      setError("Please fill in all mandatory fields (*)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/public/enroll", formData);
      if (res.data.success) {
        setSubmittedData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#304b62] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <School className="text-[#d49539]" size={28} />
            <div>
              <h2 className="text-xl font-bold">Apply for Admission (Classes 1–10)</h2>
              <p className="text-xs text-slate-300">Apex Academy • Verified Coaching & Transparency</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg">
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          {submittedData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#304b62]">Inquiry Submitted Successfully!</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Thank you, <strong>{formData.parent_name}</strong>. We have received the admission application for{" "}
                <strong>{submittedData.student_name}</strong> (Class {submittedData.target_class}).
              </p>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-w-xs mx-auto text-left">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Reference ID</div>
                <div className="font-mono font-bold text-lg text-[#d49539]">{submittedData.inquiry_id}</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">Status: Pending Verification</div>
              </div>
              <p className="text-sm text-slate-500">Our academic counselor will contact you within 24 hours.</p>
              <button
                onClick={handleReset}
                className="bg-[#304b62] hover:bg-[#253b4e] text-white font-bold px-8 py-3 rounded-lg shadow-md transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Section 1: Parent Details */}
              <div>
                <h4 className="text-sm font-bold uppercase text-[#304b62] tracking-wider mb-3 flex items-center gap-2">
                  <User size={16} className="text-[#d49539]" /> 1. Parent Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parent Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="parent_name"
                      required
                      placeholder="e.g. Sunita Sharma"
                      value={formData.parent_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        name="parent_phone"
                        required
                        placeholder="10-digit mobile number"
                        value={formData.parent_phone}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        name="parent_email"
                        placeholder="parent@example.com"
                        value={formData.parent_email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Locality / Address</label>
                    <input
                      type="text"
                      name="parent_address"
                      placeholder="e.g. Sector 14, Main Market"
                      value={formData.parent_address}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Student Academic Details */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold uppercase text-[#304b62] tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-[#d49539]" /> 2. Student & Class Selection
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="student_name"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={formData.student_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applying for Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="student_class"
                      required
                      value={formData.student_class}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm bg-white font-medium text-[#304b62]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          Class {num} (CBSE Curriculum)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current School Name</label>
                    <input
                      type="text"
                      name="school_name"
                      placeholder="e.g. Delhi Public School"
                      value={formData.school_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Batch Timing</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                      <select
                        name="preferred_batch_timing"
                        value={formData.preferred_batch_timing}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm bg-white font-medium"
                      >
                        <option value="EVENING">Evening Batch (4:30 PM – 7:30 PM)</option>
                        <option value="MORNING">Morning Batch (7:00 AM – 9:00 AM)</option>
                        <option value="WEEKEND">Weekend Intensive (Sat/Sun)</option>
                        <option value="ANY">Flexible / Any Timing</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#d49539] hover:bg-[#c0832d] text-white font-bold px-6 py-2.5 rounded-lg shadow-md transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send size={16} /> Submit Admission Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;
