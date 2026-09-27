import React, { useEffect, useState } from "react";
import { GraduationCap, Award, BookOpen, Star, Users, Send, Sparkles } from "lucide-react";
import api from "../api/axios";
import Loading from "../Components/Loading";
import EnrollmentModal from "../Components/EnrollmentModal";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacherForModal, setSelectedTeacherForModal] = useState({ name: "", subject: "" });

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/public/teachers");
        if (res.data.success) {
          setTeachers(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const openInquiryModal = (teacherName, primarySubj) => {
    setSelectedTeacherForModal({ name: teacherName, subject: primarySubj });
    setModalOpen(true);
  };

  const filteredTeachers = teachers.filter((t) => {
    if (selectedCategory === "PRIMARY") {
      return (
        (t.assigned_classes && t.assigned_classes.some((c) => c <= 5)) ||
        (t.specializations && t.specializations.some((s) => s.toLowerCase().includes("class 1") || s.toLowerCase().includes("junior") || s.toLowerCase().includes("primary") || s.toLowerCase().includes("class 5")))
      );
    }
    if (selectedCategory === "MIDDLE") {
      return (
        (t.assigned_classes && t.assigned_classes.some((c) => c >= 6 && c <= 8)) ||
        (t.specializations && t.specializations.some((s) => s.toLowerCase().includes("6") || s.toLowerCase().includes("7") || s.toLowerCase().includes("8")))
      );
    }
    if (selectedCategory === "SECONDARY") {
      return (
        (t.assigned_classes && t.assigned_classes.some((c) => c >= 9)) ||
        (t.specializations && t.specializations.some((s) => s.toLowerCase().includes("9") || s.toLowerCase().includes("10") || s.toLowerCase().includes("board")))
      );
    }
    return true;
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#d49539]/15 text-[#304b62] px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wide">
            <GraduationCap size={16} className="text-[#d49539]" /> Verified Faculty & Mentors
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#304b62] tracking-tight">
            Meet Our Expert Educators
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Dedicated primary and secondary educators committed to foundational clarity, personalized mentoring, and transparent syllabus completion for Classes 1 to 10.
          </p>

          {/* Grade Category Filters */}
          <div className="pt-4 flex items-center justify-center flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                selectedCategory === "ALL"
                  ? "bg-[#304b62] text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Educators ({teachers.length})
            </button>
            <button
              onClick={() => setSelectedCategory("PRIMARY")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                selectedCategory === "PRIMARY"
                  ? "bg-[#d49539] text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-[#f6d6a0]/40 border border-slate-200"
              }`}
            >
              Primary Wings (Classes 1–5)
            </button>
            <button
              onClick={() => setSelectedCategory("MIDDLE")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                selectedCategory === "MIDDLE"
                  ? "bg-[#d49539] text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-[#f6d6a0]/40 border border-slate-200"
              }`}
            >
              Middle School (Classes 6–8)
            </button>
            <button
              onClick={() => setSelectedCategory("SECONDARY")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                selectedCategory === "SECONDARY"
                  ? "bg-[#d49539] text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-[#f6d6a0]/40 border border-slate-200"
              }`}
            >
              Secondary Board (Classes 9–10)
            </button>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeachers.map((teacher) => {
            const teachesPrimary =
              teacher.assigned_classes?.some((c) => c <= 5) ||
              teacher.specializations?.some((s) => s.toLowerCase().includes("1") || s.toLowerCase().includes("primary") || s.toLowerCase().includes("5"));

            return (
              <div
                key={teacher._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Top */}
                <div>
                  {/* Photo & Header */}
                  <div className="relative h-64 overflow-hidden bg-[#304b62]">
                    <img
                      src={
                        teacher.photo_url ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={teacher.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Primary Badge */}
                    {teachesPrimary && (
                      <div className="absolute top-3 left-3 bg-[#d49539] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles size={12} /> Primary Grade Mentor
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-extrabold">{teacher.name}</h3>
                      <div className="text-xs text-[#f6d6a0] font-semibold">
                        {teacher.primary_subject || "Dedicated Subject Mentor"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90 font-semibold mt-1">
                        <span className="flex items-center text-[#d49539]">
                          <Star size={13} className="fill-[#d49539]" />
                          <span className="ml-1 text-white font-bold">{teacher.rating || 4.9}</span>
                        </span>
                        <span>•</span>
                        <span>{teacher.experience_years}+ Years Experience</span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    {/* Assigned Classes */}
                    {teacher.assigned_classes && teacher.assigned_classes.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Users size={12} className="text-[#304b62]" /> Assigned Classes:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {teacher.assigned_classes.map((cNum) => (
                            <span
                              key={cNum}
                              className="bg-[#304b62]/10 text-[#304b62] text-xs font-bold px-2.5 py-0.5 rounded-md"
                            >
                              Class {cNum}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qualifications */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Award size={12} className="text-[#d49539]" /> Qualifications:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.qualifications?.map((q, idx) => (
                          <span key={idx} className="bg-slate-100 text-[#304b62] text-xs font-semibold px-2 py-0.5 rounded">
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen size={12} className="text-[#d49539]" /> Core Focus:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.specializations?.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-[#f6d6a0]/30 text-[#304b62] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#d49539]/30"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {teacher.bio || "Experienced educator dedicated to student success and active concept building."}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 bg-white">
                  <button
                    onClick={() => openInquiryModal(teacher.name, teacher.primary_subject || "General Coaching")}
                    className="w-full bg-[#304b62] hover:bg-[#23384a] text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all text-xs md:text-sm flex items-center justify-center gap-2"
                  >
                    <Send size={14} /> Inquire for Class with {teacher.name.split(" ")[0]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Inquiry Modal */}
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedClass={1}
        preselectedCourse={`Mentorship with ${selectedTeacherForModal.name} (${selectedTeacherForModal.subject})`}
      />
    </div>
  );
};

export default Teachers;
