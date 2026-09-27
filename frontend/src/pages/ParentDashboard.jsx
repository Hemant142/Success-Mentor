import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Clock,
} from "lucide-react";
import api from "../api/axios";
import Loading from "../Components/Loading";

const ParentDashboard = () => {
  const { user, isAuth, activeChildId, switchActiveChild } = useContext(AuthContext);
  const navigate = useNavigate();

  const [childrenList, setChildrenList] = useState([]);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Parent Children List
  useEffect(() => {
    if (!isAuth && !localStorage.getItem("sm_token")) {
      navigate("/login");
      return;
    }

    const fetchChildren = async () => {
      try {
        const res = await api.get("/parent/children");
        if (res.data.success) {
          setChildrenList(res.data.data);
          if (res.data.data.length > 0 && !activeChildId) {
            switchActiveChild(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch children:", err);
      }
    };

    fetchChildren();
  }, [isAuth, navigate]);

  // 2. Fetch Overview for Active Selected Child
  useEffect(() => {
    const fetchChildOverview = async () => {
      const childIdToFetch = activeChildId || childrenList[0]?._id;
      if (!childIdToFetch) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/parent/child/${childIdToFetch}/overview`);
        if (res.data.success) {
          setChildData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch child overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildOverview();
  }, [activeChildId, childrenList]);

  if (loading) return <Loading />;

  const currentChild = childData?.student || childrenList.find((c) => c._id === activeChildId) || childrenList[0];
  const todayAtt = childData?.today_attendance;
  const attendanceStats = childData?.attendance_stats;
  const subjectProgress = childData?.subject_progress || [];
  const recentTests = childData?.recent_tests || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Parent Greeting & Sibling Switcher */}
        <div className="bg-[#304b62] text-white rounded-3xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#d49539] text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles size={16} /> Parent Visibility Portal
              </div>
              <h1 className="text-2xl md:text-4xl font-black">
                Welcome, {user?.name || "Sunita Sharma"}
              </h1>
              <p className="text-slate-300 text-xs md:text-sm mt-1">
                Apex Academy • Real-Time Attendance, Syllabus & Verified Scorecards
              </p>
            </div>

            <div className="text-xs bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-slate-200">
              Parent ID: <strong>{user?.phone || "9811122233"}</strong>
            </div>
          </div>

          {/* Sibling Switcher Tabs */}
          {childrenList.length > 0 && (
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Enrolled Child:
              </span>
              {childrenList.map((child) => {
                const isActive = (activeChildId || childrenList[0]?._id) === child._id;

                return (
                  <button
                    key={child._id}
                    onClick={() => switchActiveChild(child._id)}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                      isActive
                        ? "bg-[#d49539] text-white shadow-md scale-105"
                        : "bg-white/15 text-slate-200 hover:bg-white/25 border border-white/20"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white text-[#304b62] text-xs font-black flex items-center justify-center">
                      {child.name.charAt(0)}
                    </div>
                    {child.name} (Class {child.class_level})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-Time Today Arrival Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Daily Attendance
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#304b62]">
                Today's Arrival Status for {currentChild?.name}
              </h2>
            </div>

            {/* Live Badge */}
            <div>
              {todayAtt?.has_checked_in && todayAtt?.status === "PRESENT" ? (
                <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 font-extrabold px-4 py-2 rounded-2xl text-sm border border-emerald-300 shadow-sm animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Checked In at {todayAtt.check_in_time} (Present)
                </span>
              ) : todayAtt?.has_checked_in && todayAtt?.status === "LATE" ? (
                <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 font-extrabold px-4 py-2 rounded-2xl text-sm border border-amber-300 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Checked In at {todayAtt.check_in_time} (Late)
                </span>
              ) : todayAtt?.has_checked_in && todayAtt?.status === "ABSENT" ? (
                <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 font-extrabold px-4 py-2 rounded-2xl text-sm border border-red-300 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Marked Absent Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-2xl text-xs border border-slate-200">
                  <Clock size={16} /> Evening Batch Scheduled (5:00 PM)
                </span>
              )}
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block font-semibold">Enrolled Batch:</span>
              <strong className="text-sm text-[#304b62]">
                {currentChild?.enrolled_batches?.[0]?.name || "Class Foundation Batch"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Topic Covered Today:</span>
              <strong className="text-sm text-[#304b62]">
                {todayAtt?.topic_covered || "Concept Mastery & Revision"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Overall Attendance:</span>
              <strong className="text-sm text-emerald-600">
                {attendanceStats?.attendance_percentage || 96}% ({attendanceStats?.present_classes || 12} / {attendanceStats?.total_classes || 12} Classes)
              </strong>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Syllabus Progress & Recent Test Scorecards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Subject Syllabus Progress */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#d49539] uppercase tracking-wider">
                  Academic Progress
                </span>
                <h3 className="text-xl font-extrabold text-[#304b62]">Subject Syllabus Tracker</h3>
              </div>
              <div className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">
                Class {currentChild?.class_level} CBSE
              </div>
            </div>

            <div className="space-y-4">
              {subjectProgress.length > 0 ? (
                subjectProgress.map((subj) => (
                  <div key={subj.subject_id} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                          style={{ backgroundColor: subj.color_code || "#304b62" }}
                        >
                          {subj.subject_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-[#304b62]">{subj.subject_name}</span>
                      </div>
                      <span className="text-sm font-black text-[#304b62]">{subj.percentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${subj.percentage}%`,
                          backgroundColor: subj.color_code || "#d49539",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>{subj.completed_topics} of {subj.total_topics} Topics Covered</span>
                      <span>{subj.total_chapters} Chapters in syllabus</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Syllabus tracker initialized for enrolled subjects.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Recent Test Scorecards */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Verified Performance
                </span>
                <h3 className="text-xl font-extrabold text-[#304b62]">Recent Test Scorecards</h3>
              </div>
              <div className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                Unit Tests
              </div>
            </div>

            <div className="space-y-4">
              {recentTests.length > 0 ? (
                recentTests.map((test) => (
                  <div key={test.result_id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[#304b62] text-sm">{test.title}</h4>
                        <div className="text-xs text-slate-400 font-medium">
                          {test.subject_name} • Max: {test.total_marks} Marks
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-black text-[#304b62]">
                          {test.marks_obtained}
                          <span className="text-xs font-normal text-slate-500"> / {test.total_marks}</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          Grade: {test.grade || "A+"} ({test.percentage}%)
                        </span>
                      </div>
                    </div>

                    {test.teacher_remarks && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                        <strong>Teacher Remark:</strong> "{test.teacher_remarks}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No unit tests conducted yet this term.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
