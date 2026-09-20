import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Award, Clock, Sparkles, School } from "lucide-react";
import api from "../api/axios";
import Loading from "../Components/Loading";

const StudentDashboard = () => {
  const { user, isAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth && !localStorage.getItem("sm_token")) {
      navigate("/login");
      return;
    }

    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/me");
        if (res.data.success && res.data.data.profile) {
          const studentProfile = res.data.data.profile;

          // Fetch attendance summary and test results
          const [attRes, testRes] = await Promise.all([
            api.get(`/attendance/student/${studentProfile._id}/summary`),
            api.get(`/exams/student/${studentProfile._id}/results`),
          ]);

          setStudentData({
            profile: studentProfile,
            attendance: attRes.data?.data,
            tests: testRes.data?.data || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [isAuth, navigate]);

  if (loading) return <Loading />;

  const profile = studentData?.profile;
  const attendance = studentData?.attendance?.summary;
  const tests = studentData?.tests || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="bg-[#304b62] text-white rounded-3xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#d49539] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={16} /> Student Learning Portal
            </div>
            <h1 className="text-2xl md:text-4xl font-black">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Class {profile?.class_level || 9} • Roll Number: {profile?.roll_no || "SM-2026-0901"}
            </p>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-xs font-semibold text-slate-200">
            {profile?.school_name || "Delhi Public School"}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Attendance Rate <Clock size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600">
              {attendance?.attendance_percentage || 96}%
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {attendance?.present || 12} of {attendance?.total_classes || 12} sessions attended
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Enrolled Batch <School size={16} className="text-[#304b62]" />
            </div>
            <div className="text-xl font-bold text-[#304b62] truncate">
              {profile?.enrolled_batches?.[0]?.name || "Class 9 Foundation"}
            </div>
            <div className="text-xs text-slate-500 font-medium">Maths & Science</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Tests Conducted <Award size={16} className="text-[#d49539]" />
            </div>
            <div className="text-3xl font-black text-[#304b62]">{tests.length}</div>
            <div className="text-xs text-slate-500 font-medium">Periodic Assessments</div>
          </div>
        </div>

        {/* Recent Test Performance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#d49539] uppercase tracking-wider">
                My Scorecards
              </span>
              <h3 className="text-xl font-extrabold text-[#304b62]">Recent Unit Test Results</h3>
            </div>
          </div>

          <div className="space-y-4">
            {tests.length > 0 ? (
              tests.map((t, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-[#304b62] text-sm md:text-base">{t.title}</h4>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      Subject: {t.subject_name} • Max: {t.total_marks} Marks
                    </div>
                    {t.teacher_remarks && (
                      <div className="text-xs text-slate-600 mt-2 italic">
                        <strong>Teacher's Feedback:</strong> "{t.teacher_remarks}"
                      </div>
                    )}
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <div className="text-2xl font-black text-[#304b62]">
                      {t.marks_obtained} <span className="text-xs font-normal text-slate-400">/ {t.total_marks}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Grade {t.grade || "A+"} ({t.percentage}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No test scorecards uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
