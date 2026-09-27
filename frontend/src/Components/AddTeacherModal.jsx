import React, { useState } from "react";
import { X, GraduationCap, Award, BookOpen, Sparkles, CheckCircle2, UserPlus } from "lucide-react";
import api from "../api/axios";

const AddTeacherModal = ({ isOpen, onClose, onTeacherAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    primary_subject: "Primary Mathematics & Numeracy",
    qualifications: "B.Sc Mathematics, B.Ed, CTET",
    specializations: "Class 1-5 Mathematics, Mental Arithmetic, Activity-Based Learning",
    assigned_classes: [1, 2, 3, 4, 5],
    experience_years: 5,
    bio: "",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleClass = (cNum) => {
    setFormData((prev) => ({
      ...prev,
      assigned_classes: prev.assigned_classes.includes(cNum)
        ? prev.assigned_classes.filter((c) => c !== cNum)
        : [...prev.assigned_classes, cNum].sort((a, b) => a - b),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Please fill all required fields (Name, Email, Phone)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        primary_subject: formData.primary_subject,
        qualifications: formData.qualifications.split(",").map((s) => s.trim()).filter(Boolean),
        specializations: formData.specializations.split(",").map((s) => s.trim()).filter(Boolean),
        assigned_classes: formData.assigned_classes,
        experience_years: Number(formData.experience_years),
        bio: formData.bio || "Dedicated educator focused on building student conceptual clarity and academic confidence.",
        photo_url: formData.photo_url,
      };

      const res = await api.post("/admin/teachers", payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onTeacherAdded) onTeacherAdded();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to onboard educator");
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
            <Sparkles size={13} className="text-[#d49539]" /> Faculty & Mentors Directory
          </div>
          <h2 className="text-2xl font-black text-[#304b62]">Onboard New Faculty Member</h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Register educator credentials, assigned classes, core specializations, and profile bio.
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
            <h3 className="text-xl font-black text-[#304b62]">Faculty Onboarded Successfully!</h3>
            <p className="text-slate-500 text-xs">The teacher can now log in and manage attendance and scorecards.</p>
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
                  placeholder="e.g. Dr. Meenakshi Sundaram"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary EVS & Science"
                  value={formData.primary_subject}
                  onChange={(e) => setFormData({ ...formData, primary_subject: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. meenakshi@successmentor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 00008"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Assigned Classes (1-10) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <GraduationCap size={13} className="text-[#d49539]" /> Assigned Classes *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isChecked = formData.assigned_classes.includes(num);
                  return (
                    <button
                      type="button"
                      key={num}
                      onClick={() => toggleClass(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isChecked
                          ? "bg-[#304b62] text-white shadow-2xs scale-105"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Class {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qualifications & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award size={12} className="text-[#304b62]" /> Qualifications (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="M.Sc Physics, B.Ed, CTET"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <BookOpen size={12} className="text-[#304b62]" /> Specialization Areas (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="Class 1-5 Science, Hands-on Experiments, Olympiad Prep"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Educator Bio / Description
              </label>
              <textarea
                rows="2"
                placeholder="Brief bio highlighting teaching methodology and passion for student success..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#304b62] hover:bg-[#253b4e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <UserPlus size={14} />
                {loading ? "Onboarding..." : "Register Faculty"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddTeacherModal;
