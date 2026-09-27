import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Search,
  Plus,
  Phone,
  MessageCircle,
  GraduationCap,
  Star,
  Award,
  ChevronRight,
  BookOpen,
  Clock,
  UserCheck,
  Building,
  Edit2,
} from "lucide-react";
import api from "../api/axios";
import Loading from "../Components/Loading";
import CreateBatchModal from "../Components/CreateBatchModal";
import AddTeacherModal from "../Components/AddTeacherModal";
import AddStudentModal from "../Components/AddStudentModal";
import ScheduleExamModal from "../Components/ScheduleExamModal";
import EnterMarksModal from "../Components/EnterMarksModal";
import EditTeacherModal from "../Components/EditTeacherModal";
import EditBatchModal from "../Components/EditBatchModal";
import EditStudentModal from "../Components/EditStudentModal";
import EditExamModal from "../Components/EditExamModal";

const Admin = () => {
  const { isAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Active Tab state synced with URL search query
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  // Data states
  const [enrollments, setEnrollments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [exams, setExams] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [inquiryClassFilter, setInquiryClassFilter] = useState("ALL");
  const [batchClassFilter, setBatchClassFilter] = useState("ALL");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("ALL");
  const [teacherCategoryFilter, setTeacherCategoryFilter] = useState("ALL");

  // Attendance Module State
  const [attendanceBatchId, setAttendanceBatchId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceSubjectId, setAttendanceSubjectId] = useState("");
  const [attendanceTopic, setAttendanceTopic] = useState("Regular Curriculum Session");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState("");

  // Syllabus / Class inspection state
  const [selectedClassNum, setSelectedClassNum] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [activeSyllabusTree, setActiveSyllabusTree] = useState(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);

  // Modals & Popups
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [scheduleExamOpen, setScheduleExamOpen] = useState(false);
  const [enterMarksExam, setEnterMarksExam] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedBatchForApproval, setSelectedBatchForApproval] = useState({});
  const [actionMessage, setActionMessage] = useState("");

  // Sync tab with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTab = params.get("tab") || "OVERVIEW";
    setActiveTab(currentTab);
  }, [location.search]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin?tab=${tabId}`);
  };

  const fetchAllAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        enrollRes,
        batchRes,
        classRes,
        studentRes,
        teacherRes,
        examRes,
        instituteRes,
      ] = await Promise.all([
        api.get("/enrollments"),
        api.get("/batches"),
        api.get("/public/classes"),
        api.get("/admin/students").catch(() => ({ data: { success: false } })),
        api.get("/public/teachers"),
        api.get("/exams").catch(() => ({ data: { success: false } })),
        api.get("/public/institute"),
      ]);

      if (enrollRes?.data?.success && Array.isArray(enrollRes.data.data)) {
        setEnrollments(enrollRes.data.data);
      }
      if (batchRes?.data?.success && Array.isArray(batchRes.data.data)) {
        setBatches(batchRes.data.data);
        if (batchRes.data.data.length > 0) {
          setAttendanceBatchId((prev) => prev || batchRes.data.data[0]._id);
        }
      }
      if (classRes?.data?.success && Array.isArray(classRes.data.data)) {
        setClasses(classRes.data.data);
      }
      if (studentRes?.data?.success && Array.isArray(studentRes.data.data)) {
        setStudents(studentRes.data.data);
      }
      if (teacherRes?.data?.success && Array.isArray(teacherRes.data.data)) {
        setTeachers(teacherRes.data.data);
      }
      if (examRes?.data?.success && Array.isArray(examRes.data.data)) {
        setExams(examRes.data.data);
      }
      if (instituteRes?.data?.success && instituteRes.data.data?.institute) {
        setInstitute(instituteRes.data.data.institute);
      }
    } catch (err) {
      console.error("Failed to load admin dataset:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuth && !localStorage.getItem("sm_token")) {
      navigate("/login");
      return;
    }
    fetchAllAdminData();
  }, [isAuth, navigate, fetchAllAdminData]);

  // When attendance batch changes, initialize student records and default subject
  useEffect(() => {
    if (attendanceBatchId && Array.isArray(batches) && batches.length > 0) {
      const currentBatch = batches.find((b) => b?._id === attendanceBatchId);
      if (currentBatch) {
        const batchStudents = (students || []).filter((s) =>
          (s?.enrolled_batches || []).some((eb) => (eb?._id || eb) === currentBatch._id)
        );
        const initial = (batchStudents || []).map((st) => ({
          student_id: st?._id,
          student_name: st?.name || "Student",
          roll_no: st?.roll_no || "N/A",
          status: "PRESENT",
          remarks: "",
        }));
        setAttendanceRecords(initial);

        const currentClass = (classes || []).find((c) => c?.class_number === currentBatch.class_number);
        if (currentClass && Array.isArray(currentClass.subjects) && currentClass.subjects.length > 0) {
          setAttendanceSubjectId(currentClass.subjects[0]._id);
        }
      }
    }
  }, [attendanceBatchId, batches, students, classes]);

  // Load syllabus tree when selectedSubjectId changes
  useEffect(() => {
    if (selectedSubjectId) {
      const fetchSyllabus = async () => {
        setLoadingSyllabus(true);
        try {
          const res = await api.get(`/syllabus/${selectedSubjectId}`);
          if (res.data?.success && res.data.data?.syllabus) {
            setActiveSyllabusTree(res.data.data.syllabus);
          }
        } catch (err) {
          console.error("Failed to fetch subject syllabus:", err);
        } finally {
          setLoadingSyllabus(false);
        }
      };
      fetchSyllabus();
    }
  }, [selectedSubjectId]);

  // Set default selected subject when class changes
  useEffect(() => {
    const cls = (classes || []).find((c) => c?.class_number === selectedClassNum);
    if (cls && Array.isArray(cls.subjects) && cls.subjects.length > 0) {
      setSelectedSubjectId(cls.subjects[0]._id);
    } else {
      setSelectedSubjectId(null);
      setActiveSyllabusTree(null);
    }
  }, [selectedClassNum, classes]);

  const handleApprove = async (enrollmentId, studentClass) => {
    const batchId =
      selectedBatchForApproval[enrollmentId] ||
      (batches || []).find((b) => b.class_number === studentClass)?._id;

    try {
      const res = await api.patch(`/enrollments/${enrollmentId}/approve`, {
        batch_id: batchId,
      });
      if (res.data.success) {
        setActionMessage(res.data.message);
        setTimeout(() => setActionMessage(""), 5000);
        fetchAllAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve enrollment");
    }
  };

  const handleReject = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to reject this admission inquiry?")) return;

    try {
      const res = await api.patch(`/enrollments/${enrollmentId}/reject`, {
        rejection_reason: "Batch capacity reached for this term",
      });
      if (res.data.success) {
        fetchAllAdminData();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleToggleTopic = async (chapterNumber, topicId, currentStatus) => {
    if (!selectedSubjectId) return;
    try {
      const res = await api.patch(`/syllabus/${selectedSubjectId}/topic-progress`, {
        chapterNumber,
        topicId,
        is_completed: !currentStatus,
      });
      if (res.data.success) {
        setActiveSyllabusTree(res.data.data.syllabus);
        // Refresh classes list
        const classRes = await api.get("/public/classes");
        if (classRes.data?.success && Array.isArray(classRes.data.data)) {
          setClasses(classRes.data.data);
        }
      }
    } catch (err) {
      alert("Failed to update topic progress");
    }
  };

  const handleAttendanceStatusChange = (index, status) => {
    const updated = [...attendanceRecords];
    updated[index].status = status;
    setAttendanceRecords(updated);
  };

  const handleMarkAllAttendance = (status) => {
    const updated = (attendanceRecords || []).map((r) => ({ ...r, status }));
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceBatchId || attendanceRecords.length === 0) {
      alert("No students to mark attendance for this batch.");
      return;
    }
    setAttendanceSaving(true);
    setAttendanceSuccessMsg("");
    try {
      const payload = {
        batch_id: attendanceBatchId,
        date: attendanceDate,
        subject_id: attendanceSubjectId || null,
        topic_covered: attendanceTopic,
        records: (attendanceRecords || []).map((r) => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks,
        })),
      };
      const res = await api.post("/attendance/mark", payload);
      if (res.data.success) {
        setAttendanceSuccessMsg("Daily attendance register saved successfully!");
        setTimeout(() => setAttendanceSuccessMsg(""), 5000);
        fetchAllAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save attendance.");
    } finally {
      setAttendanceSaving(false);
    }
  };

  const handleToggleFeeStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === "PAID" ? "PENDING" : "PAID";
    try {
      const res = await api.patch(`/admin/students/${studentId}/fee`, {
        fee_status: newStatus,
        notes: `Marked ${newStatus} by Admin on ${new Date().toLocaleDateString()}`,
      });
      if (res.data.success) {
        fetchAllAdminData();
      }
    } catch (err) {
      alert("Failed to update fee status.");
    }
  };

  if (loading) return <Loading />;

  const pendingInquiriesCount = (enrollments || []).filter((e) => e.status === "PENDING").length;

  // Filtered queries
  const filteredEnrollments = (enrollments || []).filter((enr) => {
    if (inquiryClassFilter !== "ALL" && enr.student_class !== Number(inquiryClassFilter)) return false;
    return true;
  });

  const filteredBatches = (batches || []).filter((b) => {
    if (batchClassFilter !== "ALL" && b.class_number !== Number(batchClassFilter)) return false;
    return true;
  });

  const filteredStudents = (students || []).filter((st) => {
    const matchesQuery =
      (st.name || "").toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      (st.roll_no && st.roll_no.toLowerCase().includes(studentSearchQuery.toLowerCase())) ||
      (st.parent_id?.phone && st.parent_id.phone.includes(studentSearchQuery));
    const matchesClass =
      studentClassFilter === "ALL" || st.class_level === Number(studentClassFilter);
    return matchesQuery && matchesClass;
  });

  const filteredTeachers = (teachers || []).filter((t) => {
    if (teacherCategoryFilter === "PRIMARY") {
      return (t.assigned_classes || []).some((c) => c <= 5);
    }
    if (teacherCategoryFilter === "SECONDARY") {
      return (t.assigned_classes || []).some((c) => c > 5);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      {/* Executive Command Bar */}
      <div className="bg-[#304b62] text-white border-b border-[#253b4e] shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d49539] flex items-center justify-center text-white font-black shadow-md shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-extrabold tracking-tight">
                  {institute?.name || "Apex Academy"} Management Suite
                </h1>
                <span className="bg-[#d49539] text-[#304b62] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Admin Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Active Students: {(students || []).length} • Batches: {(batches || []).length} • Teachers: {(teachers || []).length}
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <button
              onClick={() => setAddStudentOpen(true)}
              className="px-3 py-1.5 bg-[#d49539] hover:bg-[#c0842e] text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Plus size={14} /> + Direct Admission
            </button>
            <button
              onClick={() => setCreateBatchOpen(true)}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Calendar size={14} /> + Create Batch
            </button>
            <button
              onClick={() => setScheduleExamOpen(true)}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Award size={14} /> + Schedule Test
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6">
        {/* Action Alert Banner */}
        {actionMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage("")} className="text-emerald-600 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* MODULE 1: EXECUTIVE OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Enrolled Students
                </span>
                <span className="text-2xl font-black text-[#304b62] block mt-1">{(students || []).length}</span>
                <span className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Classes 1–10 Active
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Active Batches
                </span>
                <span className="text-2xl font-black text-[#304b62] block mt-1">{(batches || []).length}</span>
                <span className="text-[11px] text-[#d49539] font-bold mt-1">Junior & Senior Wings</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Pending Inquiries
                </span>
                <span className="text-2xl font-black text-[#e11d48] block mt-1">{pendingInquiriesCount}</span>
                <button
                  onClick={() => switchTab("ENROLLMENTS")}
                  className="text-[11px] text-[#e11d48] font-bold hover:underline mt-1 block"
                >
                  Review Admissions →
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Faculty Roster
                </span>
                <span className="text-2xl font-black text-[#304b62] block mt-1">{(teachers || []).length}</span>
                <span className="text-[11px] text-blue-600 font-bold mt-1">CBSE Mentors</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Today Attendance
                </span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">96%</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1">Live Check-in Rate</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Exams & Tests
                </span>
                <span className="text-2xl font-black text-[#d49539] block mt-1">{(exams || []).length}</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1">Scheduled / Published</span>
              </div>
            </div>

            {/* Middle Grid: Running Batches & Fast Action Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-[#304b62]">
                      Live Batch Timetable & Capacity
                    </h2>
                    <p className="text-xs text-slate-500">Current coaching schedule and seat occupancy</p>
                  </div>
                  <button
                    onClick={() => switchTab("BATCHES")}
                    className="text-xs font-bold text-[#d49539] hover:underline flex items-center gap-1"
                  >
                    View All ({(batches || []).length}) <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(batches || []).slice(0, 4).map((batch) => {
                    const studentCount = batch.student_ids?.length || 0;
                    const maxCap = batch.max_capacity || 25;
                    const fillPct = Math.round((studentCount / maxCap) * 100);

                    const scheduleItem = batch.schedule && batch.schedule.length > 0 ? batch.schedule[0] : null;
                    const daysText = scheduleItem && Array.isArray(scheduleItem.days)
                      ? scheduleItem.days.slice(0, 3).join(", ")
                      : "Mon - Sat";
                    const timeText = scheduleItem
                      ? `${scheduleItem.start_time || "4:00 PM"} - ${scheduleItem.end_time || "6:00 PM"}`
                      : "Regular Hours";

                    return (
                      <div
                        key={batch._id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#d49539] transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold text-[#304b62]">{batch.name}</span>
                            <span className="bg-[#304b62] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                              Class {batch.class_number}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock size={12} className="text-[#d49539]" />
                              <span>{daysText} • {timeText}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Building size={12} className="text-[#304b62]" />
                              <span>{scheduleItem?.room || "Main Study Hall"}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                            <span>Capacity</span>
                            <span>{studentCount} / {maxCap} Seats</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#d49539] rounded-full"
                              style={{ width: `${Math.min(fillPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Recent Assessment Activity */}
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                  <h3 className="text-sm font-extrabold text-[#304b62] mb-3">Executive Shortcuts</h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setAddStudentOpen(true)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-[#304b62] hover:text-white transition-colors group flex items-center justify-between text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users size={16} className="text-[#d49539] group-hover:text-[#f6d6a0]" />
                        <span>Direct Student Admission</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
                    </button>

                    <button
                      onClick={() => switchTab("ATTENDANCE")}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-[#304b62] hover:text-white transition-colors group flex items-center justify-between text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck size={16} className="text-[#d49539] group-hover:text-[#f6d6a0]" />
                        <span>Mark Daily Batch Attendance</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
                    </button>

                    <button
                      onClick={() => setScheduleExamOpen(true)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-[#304b62] hover:text-white transition-colors group flex items-center justify-between text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award size={16} className="text-[#d49539] group-hover:text-[#f6d6a0]" />
                        <span>Schedule Assessment Test</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
                    </button>

                    <button
                      onClick={() => setAddTeacherOpen(true)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-[#304b62] hover:text-white transition-colors group flex items-center justify-between text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap size={16} className="text-[#d49539] group-hover:text-[#f6d6a0]" />
                        <span>Onboard New Teacher</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#304b62] text-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                      <Award size={16} className="text-[#d49539]" /> Recent Tests
                    </h3>
                    <button
                      onClick={() => switchTab("EXAMS")}
                      className="text-[11px] text-[#f6d6a0] hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  {(exams || []).length === 0 ? (
                    <p className="text-xs text-slate-300">No tests scheduled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {(exams || []).slice(0, 2).map((ex) => (
                        <div key={ex._id} className="p-2.5 bg-white/10 rounded-xl text-xs">
                          <div className="font-bold text-white truncate">{ex.title}</div>
                          <div className="text-[11px] text-slate-300 flex justify-between mt-1">
                            <span>{new Date(ex.exam_date).toLocaleDateString()}</span>
                            <span className="text-[#f6d6a0] font-bold">{ex.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: ADMISSIONS & INQUIRIES PIPELINE */}
        {activeTab === "ENROLLMENTS" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#304b62]">
                  Admission Inquiries & Applications Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  Manage incoming inquiries from website, review parent notes, and assign batches with one click.
                </p>
              </div>

              {/* Class Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setInquiryClassFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inquiryClassFilter === "ALL"
                      ? "bg-[#304b62] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({(enrollments || []).length})
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <button
                    key={c}
                    onClick={() => setInquiryClassFilter(c.toString())}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inquiryClassFilter === c.toString()
                        ? "bg-[#d49539] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    C{c}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-[#304b62] font-black border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Student & Grade</th>
                    <th className="p-3.5">Parent Details</th>
                    <th className="p-3.5">Preferred Time</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Batch Assignment</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(filteredEnrollments || []).length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                        No inquiries found for this filter.
                      </td>
                    </tr>
                  ) : (
                    (filteredEnrollments || []).map((enr) => {
                      const classBatches = (batches || []).filter(
                        (b) => b?.class_number === enr.student_class
                      );
                      const isPending = enr.status === "PENDING";

                      return (
                        <tr key={enr._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <div className="font-extrabold text-[#304b62] text-sm">{enr.student_name}</div>
                            <div className="text-[11px] text-slate-500">
                              Class {enr.student_class} (CBSE) • {enr.school_name || "Regular School"}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{enr.parent_name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <a
                                href={`tel:${enr.parent_phone}`}
                                className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                              >
                                <Phone size={11} /> {enr.parent_phone}
                              </a>
                              <a
                                href={`https://wa.me/91${enr.parent_phone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-green-600 hover:opacity-80"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </a>
                            </div>
                          </td>

                          <td className="p-3.5 text-slate-600 font-medium">
                            {enr.preferred_timing || "Any Slot"}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                enr.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : enr.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800 animate-pulse"
                              }`}
                            >
                              {enr.status}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {isPending ? (
                              <select
                                value={selectedBatchForApproval[enr._id] || (classBatches[0]?._id || "")}
                                onChange={(e) =>
                                  setSelectedBatchForApproval({
                                    ...selectedBatchForApproval,
                                    [enr._id]: e.target.value,
                                  })
                                }
                                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
                              >
                                {(classBatches || []).map((b) => (
                                  <option key={b._id} value={b._id}>
                                    {b.name} ({b.student_ids?.length || 0}/{b.max_capacity || 25})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-slate-500 font-medium text-[11px]">
                                {enr.batch_id?.name || "Assigned Batch"}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(enr._id, enr.student_class)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
                                >
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(enr._id)}
                                  className="p-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                                  title="Reject Inquiry"
                                >
                                  <XCircle size={15} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Completed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 3: BATCHES & TIMETABLE MANAGER */}
        {activeTab === "BATCHES" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#304b62]">
                  Batches & Timetable Management
                </h2>
                <p className="text-xs text-slate-500">
                  Configure batch schedules, room allocations, monthly tuition fees, and teacher assignments.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={batchClassFilter}
                  onChange={(e) => setBatchClassFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
                >
                  <option value="ALL">All Classes (1 to 10)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Class {c} Batches
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setCreateBatchOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#304b62] hover:bg-[#253b4e] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus size={15} /> Create New Batch
                </button>
              </div>
            </div>

            {/* Batch Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredBatches || []).map((batch) => {
                const studentCount = batch.student_ids?.length || 0;
                const maxCap = batch.max_capacity || 25;
                const fillPct = Math.round((studentCount / maxCap) * 100);

                return (
                  <div
                    key={batch._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-[#304b62] text-white text-xs font-black px-2.5 py-1 rounded-lg">
                          Class {batch.class_number} (CBSE)
                        </span>
                        <span className="text-xs font-black text-[#d49539]">
                          ₹{batch.monthly_fee || 2500}/mo
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#304b62] mb-2">{batch.name}</h3>

                      <div className="space-y-2 text-xs text-slate-600 mb-4">
                        {batch.schedule && Array.isArray(batch.schedule) && batch.schedule.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                            <Clock size={14} className="text-[#d49539] shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-slate-800">
                                {Array.isArray(batch.schedule[0].days)
                                  ? batch.schedule[0].days.join(", ")
                                  : "Monday - Saturday"}
                              </div>
                              <div className="text-slate-500">
                                {batch.schedule[0].start_time || "4:00 PM"} - {batch.schedule[0].end_time || "6:00 PM"} • Room {batch.schedule[0].room || "Hall A"}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-slate-500">
                          <GraduationCap size={14} className="text-[#304b62]" />
                          <span>
                            Teachers: {batch.teacher_ids && Array.isArray(batch.teacher_ids) && batch.teacher_ids.length > 0
                              ? batch.teacher_ids.map((t) => t?.name || t).join(", ")
                              : "Primary Mentors Roster"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                        <span>Enrolled Students</span>
                        <span>{studentCount} / {maxCap} Seats</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-[#d49539] rounded-full transition-all"
                          style={{ width: `${Math.min(fillPct, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setAttendanceBatchId(batch._id);
                            switchTab("ATTENDANCE");
                          }}
                          className="flex-1 py-2 bg-slate-100 hover:bg-[#304b62] hover:text-white rounded-xl text-xs font-bold text-slate-700 transition-colors text-center"
                        >
                          Mark Attendance
                        </button>
                        <button
                          onClick={() => setEditingBatch(batch)}
                          className="p-2 bg-slate-100 hover:bg-[#304b62] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-colors"
                          title="Edit Batch"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setScheduleExamOpen(true);
                          }}
                          className="px-3 py-2 bg-[#d49539]/10 hover:bg-[#d49539] hover:text-white text-[#d49539] rounded-xl text-xs font-bold transition-colors"
                          title="Schedule Test"
                        >
                          <Award size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULE 4: DAILY ATTENDANCE MARKER & REGISTER */}
        {activeTab === "ATTENDANCE" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-[#304b62]">
                  Daily Batch Attendance Register
                </h2>
                <p className="text-xs text-slate-500">
                  Select batch and date to record live student attendance status (Present, Absent, Late).
                </p>
              </div>

              {/* Attendance Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Select Batch
                  </label>
                  <select
                    value={attendanceBatchId}
                    onChange={(e) => setAttendanceBatchId(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
                  >
                    {(batches || []).map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} (Class {b.class_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Form */}
            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-[#304b62] mb-1">
                    Topic / Lesson Covered Today:
                  </label>
                  <input
                    type="text"
                    value={attendanceTopic}
                    onChange={(e) => setAttendanceTopic(e.target.value)}
                    placeholder="e.g. Chapter 2: Polynomials practice session"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                  />
                </div>

                {/* Batch Mark Shortcuts */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleMarkAllAttendance("PRESENT")}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    ✓ All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAllAttendance("ABSENT")}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    ✗ All Absent
                  </button>
                </div>
              </div>

              {attendanceSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle size={15} /> {attendanceSuccessMsg}
                </div>
              )}

              {/* Students Register Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-[#304b62] font-black border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Roll No</th>
                      <th className="p-3.5 text-center">Status Action</th>
                      <th className="p-3.5">Remarks / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(attendanceRecords || []).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">
                          No students enrolled in the selected batch.
                        </td>
                      </tr>
                    ) : (
                      (attendanceRecords || []).map((rec, idx) => (
                        <tr key={rec.student_id} className="hover:bg-slate-50/70">
                          <td className="p-3.5 font-bold text-[#304b62]">{rec.student_name}</td>
                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">{rec.roll_no}</td>
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAttendanceStatusChange(idx, "PRESENT")}
                                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                                  rec.status === "PRESENT"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAttendanceStatusChange(idx, "LATE")}
                                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                                  rec.status === "LATE"
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAttendanceStatusChange(idx, "ABSENT")}
                                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                                  rec.status === "ABSENT"
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <input
                              type="text"
                              value={rec.remarks || ""}
                              onChange={(e) => {
                                const updated = [...attendanceRecords];
                                updated[idx].remarks = e.target.value;
                                setAttendanceRecords(updated);
                              }}
                              placeholder="Optional remarks"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#d49539] outline-none"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={attendanceSaving || attendanceRecords.length === 0}
                  className="px-6 py-2.5 bg-[#304b62] hover:bg-[#253b4e] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <UserCheck size={16} />
                  <span>{attendanceSaving ? "Saving Register..." : "Save Today's Attendance"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODULE 5: EXAMS & ASSESSMENTS MANAGER */}
        {activeTab === "EXAMS" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#304b62]">
                  Exams, Tests & Student Scorecards
                </h2>
                <p className="text-xs text-slate-500">
                  Schedule assessments, record marks, and publish report cards visible to parents.
                </p>
              </div>

              <button
                onClick={() => setScheduleExamOpen(true)}
                className="px-4 py-2 bg-[#d49539] hover:bg-[#c0842e] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus size={15} /> + Schedule Assessment
              </button>
            </div>

            {/* Exams Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-[#304b62] font-black border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Test Title</th>
                      <th className="p-3.5">Batch & Subject</th>
                      <th className="p-3.5">Exam Date</th>
                      <th className="p-3.5">Total / Pass Marks</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(exams || []).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                          No exams or tests scheduled yet. Click "+ Schedule Assessment" above.
                        </td>
                      </tr>
                    ) : (
                      (exams || []).map((ex) => (
                        <tr key={ex._id} className="hover:bg-slate-50/70">
                          <td className="p-3.5">
                            <div className="font-bold text-[#304b62] text-sm">{ex.title}</div>
                            {ex.syllabus_topics && ex.syllabus_topics.length > 0 && (
                              <div className="text-[11px] text-slate-500">
                                Topics: {ex.syllabus_topics.join(", ")}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{ex.batch_id?.name || "Batch"}</div>
                            <div className="text-[11px] text-slate-500">
                              {ex.subject_id?.name || "Core Subject"}
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {new Date(ex.exam_date).toLocaleDateString()}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-[#304b62]">
                              {ex.total_marks} Marks
                            </span>{" "}
                            <span className="text-slate-500 text-[11px]">(Pass: {ex.passing_marks})</span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                ex.status === "PUBLISHED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {ex.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  const bStudents = (students || []).filter((st) =>
                                    (st?.enrolled_batches || []).some(
                                      (eb) => (eb?._id || eb) === (ex.batch_id?._id || ex.batch_id)
                                    )
                                  );
                                  setEnterMarksExam({ exam: ex, students: bStudents });
                                }}
                                className="px-3 py-1.5 bg-[#304b62] hover:bg-[#253b4e] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                              >
                                Enter / Edit Marks
                              </button>
                              <button
                                onClick={() => setEditingExam(ex)}
                                className="p-1.5 bg-slate-100 hover:bg-[#304b62] hover:text-white text-slate-700 rounded-xl transition-colors"
                                title="Edit Assessment Details"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 6: STUDENTS & PARENTS DIRECTORY */}
        {activeTab === "STUDENTS" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#304b62]">
                  Students & Parents Master Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Total Active Students: {(students || []).length} • Search by name, roll number, or parent mobile.
                </p>
              </div>

              <button
                onClick={() => setAddStudentOpen(true)}
                className="px-4 py-2 bg-[#d49539] hover:bg-[#c0842e] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus size={15} /> + Direct Admission
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name, roll no, or phone..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>

              <select
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
              >
                <option value="ALL">All Classes (1 to 10)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-[#304b62] font-black border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Student & Roll No</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5">Parent Info</th>
                    <th className="p-3.5">Enrolled Batch</th>
                    <th className="p-3.5 text-center">Attendance %</th>
                    <th className="p-3.5">Fee Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(filteredStudents || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">
                        No students match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    (filteredStudents || []).map((st) => {
                      const attendance = st.attendance_percentage ?? 95;
                      const isFeePaid = st.fee_status === "PAID";

                      return (
                        <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <div className="font-extrabold text-[#304b62] text-sm">{st.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{st.roll_no}</div>
                          </td>

                          <td className="p-3.5">
                            <span className="bg-[#304b62] text-white font-black text-[10px] px-2 py-0.5 rounded-md">
                              Class {st.class_level}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">
                              {st.parent_id?.name || "Parent"}
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone size={11} className="text-[#d49539]" />
                              <span>{st.parent_id?.phone || "N/A"}</span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            {st.enrolled_batches && Array.isArray(st.enrolled_batches) && st.enrolled_batches.length > 0 ? (
                              st.enrolled_batches.map((b) => (
                                <span
                                  key={b?._id || b}
                                  className="inline-block bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]"
                                >
                                  {b?.name || "Active Batch"}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">Not Assigned</span>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                attendance >= 90
                                  ? "bg-emerald-100 text-emerald-800"
                                  : attendance >= 75
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {attendance}%
                            </span>
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleFeeStatus(st._id, st.fee_status)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-transform active:scale-95 ${
                                isFeePaid
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }`}
                              title="Click to toggle fee status"
                            >
                              {st.fee_status || "PAID"}
                            </button>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingStudent(st)}
                                className="p-1.5 bg-slate-100 hover:bg-[#304b62] hover:text-white text-slate-700 rounded-xl transition-colors"
                                title="Edit Student & Parent"
                              >
                                <Edit2 size={13} />
                              </button>
                              <a
                                href={`tel:${st.parent_id?.phone}`}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-[#304b62] hover:text-white text-slate-700 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1"
                              >
                                <Phone size={12} /> Call Parent
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 7: FACULTY & MENTORS DIRECTORY */}
        {activeTab === "TEACHERS" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#304b62]">
                  Faculty & Mentors Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Dedicated primary educators (Classes 1–5) and secondary subject specialists (Classes 6–10).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setTeacherCategoryFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      teacherCategoryFilter === "ALL"
                        ? "bg-[#304b62] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({(teachers || []).length})
                  </button>
                  <button
                    onClick={() => setTeacherCategoryFilter("PRIMARY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      teacherCategoryFilter === "PRIMARY"
                        ? "bg-[#d49539] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Primary (1–5)
                  </button>
                  <button
                    onClick={() => setTeacherCategoryFilter("SECONDARY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      teacherCategoryFilter === "SECONDARY"
                        ? "bg-[#d49539] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Secondary (6–10)
                  </button>
                </div>

                <button
                  onClick={() => setAddTeacherOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#304b62] hover:bg-[#253b4e] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus size={15} /> + Onboard Teacher
                </button>
              </div>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredTeachers || []).map((teacher) => (
                <div
                  key={teacher._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={teacher.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d49539] shadow-sm shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-[#304b62]">{teacher.name}</h3>
                        <span className="text-xs font-bold text-[#d49539] block mt-0.5">
                          {teacher.primary_subject || "Senior Educator"}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                          <Star size={13} fill="currentColor" />
                          <span>{teacher.rating || 4.9} / 5.0 Rating</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-4">{teacher.bio}</p>

                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <GraduationCap size={14} className="text-[#304b62]" />
                        <span className="font-semibold">
                          {Array.isArray(teacher.qualifications)
                            ? teacher.qualifications.join(", ")
                            : "B.Ed, Master Degree"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-[#d49539]" />
                        <span>{teacher.phone || "+91 98765 43210"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-black uppercase text-slate-400 mb-1.5">
                      Assigned Grades:
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(teacher.assigned_classes || []).map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md bg-[#304b62] text-white text-[10px] font-bold"
                        >
                          Class {c}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setEditingTeacher(teacher)}
                      className="w-full py-2 bg-slate-100 hover:bg-[#304b62] hover:text-white rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Edit2 size={13} /> Edit Faculty Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 8: CBSE CLASSES & INTERACTIVE SYLLABUS MONITOR */}
        {activeTab === "CLASSES" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-[#304b62]">
                  CBSE Curriculum & Interactive Syllabus Progress
                </h2>
                <p className="text-xs text-slate-500">
                  Select a class and subject to review chapters, and toggle topic completion to update progress in real-time.
                </p>
              </div>

              {/* Class Selector Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedClassNum(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedClassNum === num
                        ? "bg-[#304b62] text-white scale-105 shadow-sm font-extrabold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Class {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Subjects Tabs */}
            {(() => {
              const currentClass = (classes || []).find((c) => c?.class_number === selectedClassNum);
              if (!currentClass) {
                return (
                  <div className="p-8 text-center text-slate-500">
                    No curriculum data found for Class {selectedClassNum}.
                  </div>
                );
              }

              const subjectsList = Array.isArray(currentClass?.subjects) ? currentClass.subjects : [];

              return (
                <div className="space-y-6">
                  {/* Subject Badges */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {subjectsList.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No subjects configured for this class.</span>
                    ) : (
                      subjectsList.map((sub) => {
                        const isSelected = selectedSubjectId === sub?._id;
                        return (
                          <button
                            key={sub?._id || sub?.name}
                            onClick={() => setSelectedSubjectId(sub?._id)}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                              isSelected
                                ? "bg-[#d49539] text-white shadow-md scale-105"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            <BookOpen size={14} />
                            <span>{sub?.name || "Subject"}</span>
                            <span className="text-[10px] bg-black/15 px-1.5 py-0.2 rounded-full">
                              {sub?.code || "CBSE"}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Syllabus Tree Content */}
                  {loadingSyllabus ? (
                    <div className="p-12 text-center text-slate-500 font-bold">
                      Loading syllabus structure...
                    </div>
                  ) : activeSyllabusTree ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-[#304b62] text-sm">
                            {activeSyllabusTree.subject_id?.name || "Subject"} Chapters & Topics
                          </h4>
                          <span className="text-xs text-slate-500">
                            Academic Year: {activeSyllabusTree.academic_year || "2026-2027"} • Total Chapters: {(activeSyllabusTree.chapters || []).length}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#d49539] bg-[#d49539]/10 px-3 py-1 rounded-xl">
                          Interactive Completion
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {(activeSyllabusTree.chapters || []).map((chap) => {
                          const totalTop = (chap?.topics || []).length;
                          const compTop = (chap?.topics || []).filter((t) => t?.is_completed).length;
                          const chapPct = totalTop > 0 ? Math.round((compTop / totalTop) * 100) : 0;

                          return (
                            <div
                              key={chap?.number || chap?.title}
                              className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-[#d49539] tracking-wider block">
                                    Chapter {chap?.number}
                                  </span>
                                  <h5 className="font-extrabold text-sm text-[#304b62]">{chap?.title}</h5>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-500">
                                    {compTop}/{totalTop} Topics ({chapPct}%)
                                  </span>
                                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full"
                                      style={{ width: `${chapPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Topics Checklist */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                {(chap?.topics || []).map((top) => (
                                  <button
                                    key={top?._id || top?.name}
                                    type="button"
                                    onClick={() => handleToggleTopic(chap.number, top?._id || top?.topic_id, top?.is_completed)}
                                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                                      top?.is_completed
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-[#d49539]"
                                    }`}
                                  >
                                    <span className="truncate pr-2">{top?.name}</span>
                                    {top?.is_completed ? (
                                      <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      Select a subject above to view its detailed chapter breakdown.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* MODULE 9: INSTITUTE SETTINGS */}
        {activeTab === "SETTINGS" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#304b62]">
                Institute Profile & Settings
              </h2>
              <p className="text-xs text-slate-500">
                Update organization name, address, contact numbers, and public details.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await api.patch("/admin/institute", institute);
                  if (res.data.success) {
                    setActionMessage("Institute profile updated successfully!");
                    setTimeout(() => setActionMessage(""), 5000);
                  }
                } catch (err) {
                  alert("Failed to update institute details");
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#304b62] mb-1">Institute Name</label>
                  <input
                    type="text"
                    value={institute?.name || ""}
                    onChange={(e) => setInstitute({ ...institute, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#304b62] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={institute?.tagline || ""}
                    onChange={(e) => setInstitute({ ...institute, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#304b62] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={institute?.contact_phone || ""}
                    onChange={(e) => setInstitute({ ...institute, contact_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#304b62] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={institute?.contact_email || ""}
                    onChange={(e) => setInstitute({ ...institute, contact_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#304b62] mb-1">Address / Location</label>
                <input
                  type="text"
                  value={institute?.address?.street || ""}
                  onChange={(e) =>
                    setInstitute({
                      ...institute,
                      address: { ...institute.address, street: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#d49539] outline-none"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#304b62] hover:bg-[#253b4e] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Reusable Modals */}
      <CreateBatchModal
        isOpen={createBatchOpen}
        onClose={() => setCreateBatchOpen(false)}
        onSuccess={(msg) => {
          setActionMessage(msg);
          setTimeout(() => setActionMessage(""), 5000);
          fetchAllAdminData();
        }}
        teachers={teachers}
      />

      <AddTeacherModal
        isOpen={addTeacherOpen}
        onClose={() => setAddTeacherOpen(false)}
        onSuccess={(msg) => {
          setActionMessage(msg);
          setTimeout(() => setActionMessage(""), 5000);
          fetchAllAdminData();
        }}
      />

      <AddStudentModal
        isOpen={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        onSuccess={(msg) => {
          setActionMessage(msg);
          setTimeout(() => setActionMessage(""), 5000);
          fetchAllAdminData();
        }}
        batches={batches}
      />

      <ScheduleExamModal
        isOpen={scheduleExamOpen}
        onClose={() => setScheduleExamOpen(false)}
        onSuccess={(msg) => {
          setActionMessage(msg);
          setTimeout(() => setActionMessage(""), 5000);
          fetchAllAdminData();
        }}
        batches={batches}
        classes={classes}
      />

      {enterMarksExam && (
        <EnterMarksModal
          isOpen={Boolean(enterMarksExam)}
          onClose={() => setEnterMarksExam(null)}
          onSuccess={(msg) => {
            setActionMessage(msg);
            setTimeout(() => setActionMessage(""), 5000);
            fetchAllAdminData();
          }}
          exam={enterMarksExam.exam}
          batchStudents={enterMarksExam.students}
        />
      )}

      {editingTeacher && (
        <EditTeacherModal
          isOpen={Boolean(editingTeacher)}
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onUpdate={() => {
            fetchAllAdminData();
            setActionMessage("Teacher profile updated successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
          onDelete={() => {
            fetchAllAdminData();
            setActionMessage("Teacher removed successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
        />
      )}

      {editingBatch && (
        <EditBatchModal
          isOpen={Boolean(editingBatch)}
          batch={editingBatch}
          teachers={teachers}
          onClose={() => setEditingBatch(null)}
          onUpdate={() => {
            fetchAllAdminData();
            setActionMessage("Batch schedule & details updated successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
          onDelete={() => {
            fetchAllAdminData();
            setActionMessage("Batch archived successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
        />
      )}

      {editingStudent && (
        <EditStudentModal
          isOpen={Boolean(editingStudent)}
          student={editingStudent}
          batches={batches}
          onClose={() => setEditingStudent(null)}
          onUpdate={() => {
            fetchAllAdminData();
            setActionMessage("Student & parent profile updated successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
          onDelete={() => {
            fetchAllAdminData();
            setActionMessage("Student profile archived successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
        />
      )}

      {editingExam && (
        <EditExamModal
          isOpen={Boolean(editingExam)}
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onUpdate={() => {
            fetchAllAdminData();
            setActionMessage("Assessment test updated successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
          onDelete={() => {
            fetchAllAdminData();
            setActionMessage("Assessment test deleted successfully!");
            setTimeout(() => setActionMessage(""), 5000);
          }}
        />
      )}
    </div>
  );
};

export default Admin;