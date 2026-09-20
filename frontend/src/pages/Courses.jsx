import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Clock, ArrowRight, Sparkles } from "lucide-react";
import api from "../api/axios";
import Loading from "../Components/Loading";
import EnrollmentModal from "../Components/EnrollmentModal";

const Courses = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassNum, setSelectedClassNum] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState({ classNum: 10, title: "" });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesRes, subjectsRes] = await Promise.all([
          api.get("/public/classes"),
          api.get("/public/subjects"),
        ]);

        if (classesRes.data.success) {
          // Sort unique classes 1 to 10
          const uniqueClasses = [];
          const seen = new Set();
          classesRes.data.data.forEach((c) => {
            if (!seen.has(c.class_number)) {
              seen.add(c.class_number);
              uniqueClasses.push(c);
            }
          });
          uniqueClasses.sort((a, b) => a.class_number - b.class_number);
          setClasses(uniqueClasses);
        }

        if (subjectsRes.data.success) {
          setSubjects(subjectsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load courses data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEnrollModal = (classNum, title) => {
    setSelectedCourseForModal({ classNum, title });
    setModalOpen(true);
  };

  const filteredClasses =
    selectedClassNum === "ALL"
      ? classes
      : classes.filter((c) => c.class_number === Number(selectedClassNum));

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 lg:px-12">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-10 text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#d49539]/15 text-[#304b62] px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wide">
          <Sparkles size={16} className="text-[#d49539]" /> CBSE Classes 1 to 10 Curriculum
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#304b62] tracking-tight">
          Explore Coaching Batches & Syllabus
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">
          Complete conceptual coaching for Classes 1–10 with real-time syllabus tracking, daily check-in attendance, and transparent parent visibility.
        </p>

        {/* Class Filter Chips (1 to 10) */}
        <div className="pt-6 flex items-center justify-center flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => setSelectedClassNum("ALL")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
              selectedClassNum === "ALL"
                ? "bg-[#304b62] text-white shadow-md scale-105"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Classes (1–10)
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedClassNum(num.toString())}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                selectedClassNum === num.toString()
                  ? "bg-[#d49539] text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-[#f6d6a0]/40 border border-slate-200"
              }`}
            >
              Class {num}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => {
          const classSubjects = subjects.filter((s) => s.class_id === cls._id || s.class_id?._id === cls._id);
          const isHighSchool = cls.class_number >= 9;
          const isMiddleSchool = cls.class_number >= 6 && cls.class_number <= 8;

          return (
            <div
              key={cls._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col justify-between group"
            >
              {/* Card Top */}
              <div>
                {/* Header Badge */}
                <div className="bg-[#304b62] p-5 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#d49539]">
                      {isHighSchool ? "Secondary Board Prep" : isMiddleSchool ? "Middle School Foundation" : "Primary Mastery"}
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">{cls.name}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-extrabold text-xl text-[#d49539] border border-white/20">
                    C-{cls.class_number}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {cls.description || `Standard CBSE Class ${cls.class_number} curriculum covering core concept mastery and regular tests.`}
                  </p>

                  {/* Subjects Tags */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#d49539]" /> Subjects Covered ({classSubjects.length || 4}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {classSubjects.length > 0 ? (
                        classSubjects.map((subj) => (
                          <span
                            key={subj._id}
                            className="bg-slate-100 hover:bg-slate-200 text-[#304b62] font-semibold text-xs px-2.5 py-1 rounded-md border border-slate-200"
                          >
                            {subj.name}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="bg-slate-100 text-xs px-2.5 py-1 rounded-md font-semibold text-[#304b62]">Mathematics</span>
                          <span className="bg-slate-100 text-xs px-2.5 py-1 rounded-md font-semibold text-[#304b62]">Science</span>
                          <span className="bg-slate-100 text-xs px-2.5 py-1 rounded-md font-semibold text-[#304b62]">English</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Syllabus Progress Tracker Bar */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#304b62] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#d49539]" /> Live Syllabus Tracker
                      </span>
                      <span className="font-extrabold text-[#d49539]">
                        {cls.syllabus_progress_pct || 32}% Covered
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#304b62] to-[#d49539] rounded-full transition-all duration-500"
                        style={{ width: `${cls.syllabus_progress_pct || 32}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{cls.completed_chapters || 2} Chapters Done</span>
                      <span>{cls.total_chapters || 8} Total Chapters</span>
                    </div>
                  </div>

                  {/* Assigned Faculty Mentors */}
                  {cls.assigned_teachers && cls.assigned_teachers.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Users size={12} className="text-[#304b62]" /> Dedicated Class Mentors:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cls.assigned_teachers.slice(0, 3).map((t) => (
                          <div
                            key={t._id}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs px-2 py-1 rounded-lg shadow-2xs"
                          >
                            <img
                              src={t.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                              alt={t.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="font-semibold text-[#304b62]">{t.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features List */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#304b62]" /> 4-5 Days/Week
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#304b62]" /> Max 20-25 Students
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 bg-white">
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Starting from</span>
                    <span className="text-xl font-extrabold text-[#304b62]">
                      ₹{cls.monthly_base_fee || 2000}
                      <span className="text-xs font-normal text-slate-500"> /month</span>
                    </span>
                  </div>

                  <Link
                    to={`/courses/${cls._id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#304b62] hover:text-[#d49539] transition-colors group-hover:translate-x-1 duration-200"
                  >
                    View Syllabus <ArrowRight size={16} />
                  </Link>
                </div>

                <button
                  onClick={() => openEnrollModal(cls.class_number, cls.name)}
                  className="w-full bg-[#d49539] hover:bg-[#c0832d] text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                >
                  Enroll Child Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admission Inquiry Modal */}
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedClass={selectedCourseForModal.classNum}
        preselectedCourse={selectedCourseForModal.title}
      />
    </div>
  );
};

export default Courses;
