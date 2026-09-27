import React, { useState, useEffect } from "react";
import { X, GraduationCap, Award, BookOpen, Sparkles, CheckCircle2, Save, Trash2 } from "lucide-react";
import api from "../api/axios";

const EditTeacherModal = ({ isOpen, onClose, teacher, onUpdate, onDelete, onTeacherUpdated, onTeacherDeleted }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    primary_subject: "",
    qualifications: "",
    specializations: "",
    assigned_classes: [],
    experience_years: 5,
    bio: "",
    rating: 4.9,
    photo_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        primary_subject: teacher.primary_subject || "",
        qualifications: Array.isArray(teacher.qualifications)
          ? teacher.qualifications.join(", ")
          : teacher.qualifications || "",
        specializations: Array.isArray(teacher.specializations)
          ? teacher.specializations.join(", ")
          : teacher.specializations || "",
        assigned_classes: Array.isArray(teacher.assigned_classes) ? teacher.assigned_classes : [],
        experience_years: teacher.experience_years || 5,
        bio: teacher.bio || "",
        rating: teacher.rating || 4.9,
        photo_url: teacher.photo_url || "",
      });
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

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
    if (!formData.name.trim()) {
      setError("Teacher name is required");
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
        qualifications: formData.qualifications
          ? formData.qualifications.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        specializations: formData.specializations
          ? formData.specializations.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        assigned_classes: formData.assigned_classes,
        experience_years: Number(formData.experience_years),
        bio: formData.bio,
        rating: Number(formData.rating),
        photo_url: formData.photo_url,
      };

      const res = await api.patch(`/admin/teachers/${teacher._id}`, payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onUpdate) onUpdate();
          if (onTeacherUpdated) onTeacherUpdated();
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove ${teacher.name} from faculty roster?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.delete(`/admin/teachers/${teacher._id}`);
      if (res.data.success) {
        if (onDelete) onDelete();
        if (onTeacherDeleted) onTeacherDeleted();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete teacher");
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
          <h2 className="text-2xl font-black text-[#304b62]">Edit Faculty Profile</h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Update educator credentials, primary subject, assigned grades, bio, and ratings.
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
            <h3 className="text-xl font-black text-[#304b62]">Teacher Profile Updated!</h3>
            <p className="text-slate-500 text-xs">All changes have been synchronized across the platform.</p>
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
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#304b62] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.primary_subject}
                  onChange={(e) => setFormData({ ...formData, primary_subject: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#304b62] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Assigned Classes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <GraduationCap size={13} className="text-[#d49539]" /> Assigned Classes
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

            {/* Qualifications & Experience & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award size={12} className="text-[#304b62]" /> Qualifications
                </label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Experience (Yrs)
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rating (0 to 5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <BookOpen size={12} className="text-[#304b62]" /> Specialization Topics (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Photo URL
              </label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
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
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Remove Faculty
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

export default EditTeacherModal;
