import React, { useState } from "react";
import { X, Calendar, Clock, Users, School, Sparkles, CheckCircle2 } from "lucide-react";
import api from "../api/axios";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CreateBatchModal = ({ isOpen, onClose, teachers = [], onBatchCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    class_number: 1,
    teacher_id: teachers[0]?._id || "",
    selectedDays: ["MON", "WED", "FRI"],
    start_time: "16:00",
    end_time: "17:15",
    room: "Junior Room 1",
    monthly_fee: 1800,
    max_capacity: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide a batch name");
      return;
    }
    if (formData.selectedDays.length === 0) {
      setError("Please select at least one schedule day");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const schedule = formData.selectedDays.map((day) => ({
        day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room,
      }));

      const payload = {
        name: formData.name,
        class_number: Number(formData.class_number),
        class_id: `class_${formData.class_number}`,
        teacher_ids: formData.teacher_id ? [formData.teacher_id] : [],
        schedule,
        monthly_fee: Number(formData.monthly_fee),
        max_capacity: Number(formData.max_capacity),
      };

      const res = await api.post("/batches", payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onBatchCreated) onBatchCreated();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 bg-[#d49539]/15 text-[#304b62] px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles size={13} className="text-[#d49539]" /> Timetable & Batch Manager
          </div>
          <h2 className="text-2xl font-black text-[#304b62]">Create New Coaching Batch</h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Configure class schedule, assigned educator, room allotment, and student capacity.
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
            <h3 className="text-xl font-black text-[#304b62]">Batch Created Successfully!</h3>
            <p className="text-slate-500 text-xs">The new batch schedule is now active across institute portals.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Batch Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Class 5 - Science & Maths Star Batch"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#304b62]"
              />
            </div>

            {/* Target Class & Assigned Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Class *
                </label>
                <select
                  value={formData.class_number}
                  onChange={(e) => {
                    const cNum = Number(e.target.value);
                    setFormData({
                      ...formData,
                      class_number: cNum,
                      monthly_fee: 1500 + cNum * 150,
                    });
                  }}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      Class {num} ({num <= 5 ? "Primary Wings" : num <= 8 ? "Middle School" : "Secondary Board"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lead Faculty Mentor *
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white font-medium"
                >
                  {(teachers || []).map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.primary_subject || t.specializations?.[0] || "Educator"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weekly Days Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-[#d49539]" /> Weekly Schedule Days *
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const isSelected = formData.selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#304b62] text-white shadow-sm scale-105"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timing & Room Allocation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-[#304b62]" /> Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-[#304b62]" /> End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <School size={12} className="text-[#304b62]" /> Classroom
                </label>
                <select
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50"
                >
                  <option value="Junior Room 1">Junior Room 1 (Class 1-3)</option>
                  <option value="Junior Room 2">Junior Room 2 (Class 4-5)</option>
                  <option value="Senior Room 1">Senior Room 1 (Class 6-8)</option>
                  <option value="Board Room 1">Board Room 1 (Class 9-10)</option>
                </select>
              </div>
            </div>

            {/* Capacity & Monthly Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users size={13} className="text-[#304b62]" /> Max Student Capacity
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Tuition Fee (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  step="50"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 bg-slate-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
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
                {loading ? "Creating Batch..." : "Publish Batch Schedule"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateBatchModal;
