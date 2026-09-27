import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  ArrowLeft,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Check,
} from "lucide-react";
import api from "../api/axios";
import Loading from "../Components/Loading";
import EnrollmentModal from "../Components/EnrollmentModal";

const IndividualCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [expandedChapters, setExpandedChapters] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/public/courses/${id}`);
        if (res.data.success) {
          setCourseData(res.data.data);
          if (res.data.data.subjects?.length > 0) {
            setActiveSubjectId(res.data.data.subjects[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load course details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const toggleChapter = (chapNum) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapNum]: !prev[chapNum],
    }));
  };

  if (loading) return <Loading />;
  if (!courseData || !courseData.class) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-[#304b62]">Course Not Found</h2>
        <button
          onClick={() => navigate("/courses")}
          className="bg-[#304b62] text-white px-6 py-2 rounded-lg font-semibold"
        >
          Return to Courses Directory
        </button>
      </div>
    );
  }

  const { class: cls, subjects, batches, assigned_teachers } = courseData;
  const activeSubject = subjects.find((s) => s._id === activeSubjectId) || subjects[0];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link to="/courses" className="hover:text-[#304b62] flex items-center gap-1">
            <ArrowLeft size={16} /> Courses Directory
          </Link>
          <span>/</span>
          <span className="text-[#304b62] font-bold">{cls.name}</span>
        </div>

        {/* Hero Section */}
        <div className="bg-[#304b62] text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#d49539]/20 text-[#d49539] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <Sparkles size={14} /> Comprehensive CBSE Coaching Program
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{cls.name} (CBSE)</h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                {cls.description ||
                  "Structured syllabus completion, daily attendance tracking with instant check-in verification, weekly test series, and dedicated concept revision."}
              </p>

              {/* Progress & Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs md:text-sm font-semibold text-slate-200">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <BookOpen size={16} className="text-[#d49539]" /> {subjects.length} Core Subjects
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Sparkles size={16} className="text-[#d49539]" /> {cls.overall_progress_pct || 35}% Overall Syllabus Done
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Clock size={16} className="text-[#d49539]" /> 5 Days/Week Batches
                </div>
              </div>
            </div>

            {/* Tuition Fee & CTA Box */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-4 shrink-0 min-w-[250px]">
              <div>
                <span className="text-xs text-slate-300 uppercase tracking-wider">Monthly Base Fee</span>
                <div className="text-3xl font-extrabold text-white">
                  ₹{cls.monthly_base_fee || 2500}
                  <span className="text-xs font-normal text-slate-300"> /month</span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-[#d49539] hover:bg-[#c0832d] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Send size={16} /> Enroll Child Now
              </button>
            </div>
          </div>
        </div>

        {/* Assigned Class Faculty Section */}
        {assigned_teachers && assigned_teachers.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#304b62] font-extrabold text-base md:text-lg">
                <Users size={20} className="text-[#d49539]" /> Dedicated Faculty Mentors for {cls.name}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {assigned_teachers.length} Assigned Mentors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assigned_teachers.map((t) => (
                <div
                  key={t._id}
                  className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
                >
                  <img
                    src={t.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                    alt={t.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-[#304b62]">{t.name}</div>
                    <div className="text-xs font-semibold text-[#d49539]">
                      {t.primary_subject || t.specializations?.[0] || "Subject Mentor"}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center text-[#d49539]">
                        <Star size={11} className="fill-[#d49539]" /> {t.rating || 4.9}
                      </span>
                      <span>•</span>
                      <span>{t.experience_years}+ Years Exp</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Layout: Subjects & Syllabus Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Subject Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#304b62]">Subjects Catalog</h3>
            <div className="space-y-2.5">
              {subjects.map((subj) => {
                const isActive = subj._id === activeSubjectId;
                const chapterCount = subj.syllabus?.length || 0;
                const progress = subj.progress_pct || 0;

                return (
                  <button
                    key={subj._id}
                    onClick={() => setActiveSubjectId(subj._id)}
                    className={`w-full text-left p-4 rounded-xl font-bold transition-all flex items-center justify-between border ${
                      isActive
                        ? "bg-white text-[#304b62] border-[#d49539] shadow-md border-l-4"
                        : "bg-white/70 hover:bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: subj.color_code || "#304b62" }}
                      >
                        {subj.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{subj.name}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          {chapterCount} Chapters • {subj.completed_chapters || 0} Done
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          progress === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : progress > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {progress}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Batches Info Card */}
            {batches && batches.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-[#304b62] uppercase tracking-wider">Active Batches</h4>
                {batches.map((b) => (
                  <div key={b._id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-[#304b62]">{b.name}</div>
                    <div className="text-slate-500">
                      Schedule: {b.schedule?.map((s) => s.day).join(", ") || "Mon, Wed, Fri"} (5:00 PM)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Chapter & Topic Tree */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header & Progress Summary for Active Subject */}
              <div className="space-y-4 pb-4 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#d49539] uppercase tracking-wider">
                      Live Curriculum Tracking
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#304b62]">
                      {activeSubject ? activeSubject.name : "Subject"} Syllabus
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg">
                      {activeSubject?.completed_chapters || 0} Completed
                    </span>
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg">
                      {activeSubject?.in_progress_chapters || 0} In Progress
                    </span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                      {activeSubject?.syllabus?.length || 0} Total Chapters
                    </span>
                  </div>
                </div>

                {/* Progress Bar for Active Subject */}
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#304b62]">Subject Completion Status</span>
                    <span className="font-extrabold text-[#d49539]">
                      {activeSubject?.progress_pct || 0}% Completed ({activeSubject?.completed_topics || 0} of{" "}
                      {activeSubject?.total_topics || 0} Topics Taught)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#304b62] to-[#d49539] rounded-full transition-all duration-500"
                      style={{ width: `${activeSubject?.progress_pct || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Chapters Accordion */}
              {activeSubject && activeSubject.syllabus && activeSubject.syllabus.length > 0 ? (
                <div className="space-y-3.5">
                  {activeSubject.syllabus.map((chap) => {
                    const isExpanded = expandedChapters[chap.number] !== false; // default expanded
                    const isCompleted = chap.status === "COMPLETED";
                    const isInProgress = chap.status === "IN_PROGRESS";

                    return (
                      <div
                        key={chap.number}
                        className={`border rounded-xl overflow-hidden transition-all bg-white ${
                          isCompleted
                            ? "border-emerald-200 shadow-2xs"
                            : isInProgress
                            ? "border-amber-300 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <button
                          onClick={() => toggleChapter(chap.number)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : isInProgress
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isCompleted ? <Check size={14} /> : chap.number}
                            </span>
                            <div>
                              <div className="font-bold text-sm md:text-base text-[#304b62]">{chap.title}</div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {chap.completed_topics_count || 0} of {chap.total_topics_count || 0} Topics Covered
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Chapter Status Badge */}
                            {isCompleted ? (
                              <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-emerald-600" /> Completed
                              </span>
                            ) : isInProgress ? (
                              <span className="text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <Sparkles size={12} className="text-amber-600" /> In Progress ({chap.progress_pct}%)
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                                Upcoming
                              </span>
                            )}

                            <div className="text-slate-400">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                        </button>

                        {isExpanded && chap.topics && chap.topics.length > 0 && (
                          <div className="px-5 pb-4 pt-1 bg-slate-50/70 border-t border-slate-100">
                            <ul className="space-y-2">
                              {chap.topics.map((topic, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center justify-between text-xs md:text-sm text-slate-700 py-1"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <CheckCircle2
                                      size={16}
                                      className={
                                        topic.is_completed ? "text-emerald-500 fill-emerald-50" : "text-slate-300"
                                      }
                                    />
                                    <span className={topic.is_completed ? "font-medium text-slate-800" : "text-slate-500"}>
                                      {topic.name}
                                    </span>
                                  </div>

                                  {topic.is_completed ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      Taught & Tested
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                      Upcoming
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>Detailed syllabus topics being updated according to latest CBSE blueprint.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedClass={cls.class_number}
        preselectedCourse={cls.name}
      />
    </div>
  );
};

export default IndividualCourse;
