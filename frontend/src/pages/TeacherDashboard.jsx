import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  Send,
  PlusCircle,
} from "lucide-react";
import api from "../api/axios";
import Loading from "../Components/Loading";

const TeacherDashboard = () => {
  const { user, isAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("ATTENDANCE"); // "ATTENDANCE" | "SYLLABUS" | "EXAMS"
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [batchDetails, setBatchDetails] = useState(null);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [topicCovered, setTopicCovered] = useState("");
  const [attendanceMsg, setAttendanceMsg] = useState("");

  // Syllabus state
  const [syllabusData, setSyllabusData] = useState(null);
  const [syllabusMsg, setSyllabusMsg] = useState("");

  // Exam / Test state
  const [exams, setExams] = useState([]);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamMaxMarks, setNewExamMaxMarks] = useState(50);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examMarks, setExamMarks] = useState({});
  const [examRemarks, setExamRemarks] = useState({});
  const [examMsg, setExamMsg] = useState("");

  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Fetch Batches
  useEffect(() => {
    if (!isAuth && !localStorage.getItem("sm_token")) {
      navigate("/login");
      return;
    }

    const fetchTeacherBatches = async () => {
      setLoading(true);
      try {
        const res = await api.get("/batches");
        if (res.data.success) {
          setBatches(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedBatchId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherBatches();
  }, [isAuth, navigate]);

  // 2. Fetch Details for Selected Batch
  useEffect(() => {
    if (!selectedBatchId) return;

    const fetchBatchData = async () => {
      try {
        const [batchRes, examsRes] = await Promise.all([
          api.get(`/batches/${selectedBatchId}`),
          api.get(`/exams/batch/${selectedBatchId}`),
        ]);

        if (batchRes.data.success) {
          const b = batchRes.data.data;
          setBatchDetails(b);

          // Initialize attendance default states (PRESENT)
          const initialAtt = {};
          const now = new Date();
          const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

          b.student_ids?.forEach((s) => {
            initialAtt[s._id] = {
              status: "PRESENT",
              check_in_time: currentTimeStr,
              remarks: "",
            };
          });
          setAttendanceRecords(initialAtt);

          // Fetch Syllabus for first subject in batch
          if (b.subject_ids?.length > 0) {
            const firstSubjectId = b.subject_ids[0]._id || b.subject_ids[0];
            const sylRes = await api.get(`/syllabus/subject/${firstSubjectId}`);
            if (sylRes.data.success) {
              setSyllabusData(sylRes.data.data);
            }
          }
        }

        if (examsRes.data.success) {
          setExams(examsRes.data.data);
          if (examsRes.data.data.length > 0) {
            setSelectedExamId(examsRes.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch batch data:", err);
      }
    };

    fetchBatchData();
  }, [selectedBatchId]);

  // Handle Attendance Status Toggle
  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus,
      },
    }));
  };

  // Submit Batch Attendance
  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!selectedBatchId) return;

    const recordsArray = Object.keys(attendanceRecords).map((studentId) => ({
      student_id: studentId,
      status: attendanceRecords[studentId].status,
      check_in_time: attendanceRecords[studentId].check_in_time,
      remarks: attendanceRecords[studentId].remarks,
    }));

    try {
      const res = await api.post("/attendance/mark", {
        batch_id: selectedBatchId,
        date: new Date(),
        subject_id: batchDetails?.subject_ids?.[0]?._id,
        topic_covered: topicCovered || "Regular concept coaching & practice",
        records: recordsArray,
      });

      if (res.data.success) {
        setAttendanceMsg("Attendance submitted and timestamps recorded for all students!");
        setTimeout(() => setAttendanceMsg(""), 5000);
      }
    } catch (err) {
      alert("Failed to save attendance");
    }
  };

  // Toggle Syllabus Topic
  const handleToggleTopic = async (topic) => {
    if (!syllabusData?.syllabus?.subject_id) return;
    const subjectId = syllabusData.syllabus.subject_id._id || syllabusData.syllabus.subject_id;

    try {
      const res = await api.patch(`/syllabus/subject/${subjectId}/topic`, {
        topicId: topic.topic_id || topic._id,
        topicName: topic.name,
        is_completed: !topic.is_completed,
      });

      if (res.data.success) {
        // Refresh syllabus
        const updatedRes = await api.get(`/syllabus/subject/${subjectId}`);
        if (updatedRes.data.success) {
          setSyllabusData(updatedRes.data.data);
        }
        setSyllabusMsg(`Updated progress for topic: "${topic.name}"`);
        setTimeout(() => setSyllabusMsg(""), 4000);
      }
    } catch (err) {
      alert("Failed to update topic");
    }
  };

  // Create New Unit Test
  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExamTitle || !selectedBatchId) return;

    try {
      const res = await api.post("/exams", {
        batch_id: selectedBatchId,
        subject_id: batchDetails?.subject_ids?.[0]?._id || "class_10_subject_3",
        title: newExamTitle,
        exam_date: new Date(),
        total_marks: Number(newExamMaxMarks) || 50,
      });

      if (res.data.success) {
        setExams([res.data.data, ...exams]);
        setSelectedExamId(res.data.data._id);
        setNewExamTitle("");
        setExamMsg("New test created! You can now enter student marks below.");
        setTimeout(() => setExamMsg(""), 5000);
      }
    } catch (err) {
      alert("Failed to create test");
    }
  };

  // Submit Exam Results
  const handleSaveExamResults = async () => {
    if (!selectedExamId || !batchDetails?.student_ids) return;

    const resultsArray = batchDetails.student_ids.map((s) => ({
      student_id: s._id,
      marks_obtained: Number(examMarks[s._id]) || 0,
      is_absent: false,
      remarks: examRemarks[s._id] || "Consistent effort",
    }));

    try {
      const res = await api.post(`/exams/${selectedExamId}/results`, {
        results: resultsArray,
      });

      if (res.data.success) {
        setExamMsg("Test results published! Parents can now view the scorecards.");
        setTimeout(() => setExamMsg(""), 5000);
      }
    } catch (err) {
      alert("Failed to save results");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Bar / Header */}
        <div className="bg-[#304b62] text-white rounded-3xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#d49539] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={16} /> Educator Portal
            </div>
            <h1 className="text-2xl md:text-4xl font-black">
              Welcome, {user?.name || "Teacher"}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Manage Daily Attendance, Syllabus Milestones, and Unit Test Results
            </p>
          </div>

          {/* Batch Selector Dropdown */}
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Batch:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="bg-white text-[#304b62] font-bold text-sm px-3 py-1.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#d49539]"
            >
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} (Class {b.class_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("ATTENDANCE")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "ATTENDANCE"
                ? "bg-[#304b62] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Clock size={16} /> 1-Click Batch Attendance
          </button>

          <button
            onClick={() => setActiveTab("SYLLABUS")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "SYLLABUS"
                ? "bg-[#304b62] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen size={16} /> Syllabus Progress Tracker
          </button>

          <button
            onClick={() => setActiveTab("EXAMS")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "EXAMS"
                ? "bg-[#304b62] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Award size={16} /> Tests & Marks Entry
          </button>
        </div>

        {/* Tab 1: 1-Click Attendance Sheet */}
        {activeTab === "ATTENDANCE" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-[#304b62]">
                  Daily Attendance Sheet • {batchDetails?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Mark student presence and arrival timestamps. Parents receive instant notification.
                </p>
              </div>
              <div className="text-xs font-bold bg-[#f6d6a0]/40 text-[#304b62] px-3.5 py-1.5 rounded-xl border border-[#d49539]/30">
                Today: {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>

            {attendanceMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" /> {attendanceMsg}
              </div>
            )}

            {/* Topic Covered Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Topic Covered in Today's Class:
              </label>
              <input
                type="text"
                placeholder="e.g. Quadratic Equations: Nature of Roots and Word Problems"
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#d49539] text-sm text-slate-800"
              />
            </div>

            {/* Student Roster Table */}
            {batchDetails?.student_ids?.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No students enrolled in this batch yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-4">Roll No</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Status Toggle</th>
                      <th className="p-3.5">Check-in Time</th>
                      <th className="p-3.5 pr-4">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchDetails?.student_ids?.map((student) => {
                      const rec = attendanceRecords[student._id] || { status: "PRESENT", check_in_time: "17:00" };

                      return (
                        <tr key={student._id} className="hover:bg-slate-50/70">
                          <td className="p-3.5 pl-4 font-mono font-bold text-xs text-slate-500">
                            {student.roll_no || "SM-001"}
                          </td>
                          <td className="p-3.5 font-bold text-[#304b62]">{student.name}</td>
                          <td className="p-3.5">
                            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 gap-1">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student._id, "PRESENT")}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                                  rec.status === "PRESENT"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student._id, "LATE")}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                                  rec.status === "LATE"
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student._id, "ABSENT")}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                                  rec.status === "ABSENT"
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <input
                              type="time"
                              value={rec.check_in_time || "17:00"}
                              onChange={(e) =>
                                setAttendanceRecords((prev) => ({
                                  ...prev,
                                  [student._id]: {
                                    ...prev[student._id],
                                    check_in_time: e.target.value,
                                  },
                                }))
                              }
                              className="px-2 py-1 border border-slate-200 rounded-md text-xs text-slate-700 bg-white"
                            />
                          </td>
                          <td className="p-3.5 pr-4">
                            <input
                              type="text"
                              placeholder="e.g. Active in solving equations"
                              value={rec.remarks || ""}
                              onChange={(e) =>
                                setAttendanceRecords((prev) => ({
                                  ...prev,
                                  [student._id]: {
                                    ...prev[student._id],
                                    remarks: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-1 border border-slate-200 rounded-md text-xs text-slate-700"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveAttendance}
                className="bg-[#d49539] hover:bg-[#c0832d] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors text-sm flex items-center gap-2"
              >
                <CheckCircle size={18} /> Save & Record Batch Attendance
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Syllabus Progress Tracker */}
        {activeTab === "SYLLABUS" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-[#304b62]">
                  Syllabus Tracker • {syllabusData?.syllabus?.subject_id?.name || "Mathematics"}
                </h3>
                <p className="text-xs text-slate-500">
                  Click on any topic to mark as completed. Progress updates live on the Parent portal.
                </p>
              </div>

              {/* Progress Metric Badge */}
              <div className="bg-[#304b62] text-white px-5 py-3 rounded-2xl text-center">
                <span className="text-xs uppercase tracking-wider text-[#d49539] font-bold block">
                  Overall Completion
                </span>
                <span className="text-2xl font-black">{syllabusData?.metrics?.completion_percentage || 55}%</span>
              </div>
            </div>

            {syllabusMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" /> {syllabusMsg}
              </div>
            )}

            {/* Chapters & Topics Checklist */}
            <div className="space-y-4">
              {syllabusData?.syllabus?.chapters?.map((chap) => (
                <div key={chap.number} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#304b62] text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#304b62] text-[#d49539] text-xs font-black flex items-center justify-center">
                        {chap.number}
                      </span>
                      {chap.title}
                    </h4>
                    <span className="text-xs text-slate-400 font-semibold">{chap.topics?.length} topics</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                    {chap.topics?.map((topic, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleTopic(topic)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          topic.is_completed
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs md:text-sm">{topic.name}</span>
                        <CheckCircle
                          size={18}
                          className={topic.is_completed ? "text-emerald-600 shrink-0" : "text-slate-300 shrink-0"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Exams & Results Entry */}
        {activeTab === "EXAMS" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-[#304b62]">Unit Tests & Scorecards Entry</h3>
                <p className="text-xs text-slate-500">
                  Create unit tests and publish student marks with personalized remarks.
                </p>
              </div>
            </div>

            {examMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" /> {examMsg}
              </div>
            )}

            {/* Create Test Form */}
            <form onSubmit={handleCreateExam} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Test Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 2 - Quadratic Equations"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="w-28">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max Marks
                </label>
                <input
                  type="number"
                  required
                  value={newExamMaxMarks}
                  onChange={(e) => setNewExamMaxMarks(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="pt-5">
                <button
                  type="submit"
                  className="bg-[#304b62] hover:bg-[#253b4e] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle size={15} /> Create Test
                </button>
              </div>
            </form>

            {/* Scorecard Marks Entry Table */}
            {exams.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#304b62] text-sm">
                    Enter Scores for: <strong>{exams.find((x) => x._id === selectedExamId)?.title || "Unit Test"}</strong>
                  </h4>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white font-medium text-slate-700"
                  >
                    {exams.map((ex) => (
                      <option key={ex._id} value={ex._id}>
                        {ex.title} (Max: {ex.total_marks})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-3 pl-4">Student Name</th>
                        <th className="p-3">Marks Obtained</th>
                        <th className="p-3 pr-4">Teacher Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batchDetails?.student_ids?.map((student) => (
                        <tr key={student._id}>
                          <td className="p-3 pl-4 font-bold text-[#304b62]">{student.name}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              placeholder="0"
                              value={examMarks[student._id] || ""}
                              onChange={(e) =>
                                setExamMarks((prev) => ({
                                  ...prev,
                                  [student._id]: e.target.value,
                                }))
                              }
                              className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-[#304b62]"
                            />
                          </td>
                          <td className="p-3 pr-4">
                            <input
                              type="text"
                              placeholder="e.g. Good concept application in geometry"
                              value={examRemarks[student._id] || ""}
                              onChange={(e) =>
                                setExamRemarks((prev) => ({
                                  ...prev,
                                  [student._id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveExamResults}
                    className="bg-[#d49539] hover:bg-[#c0832d] text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm flex items-center gap-2"
                  >
                    <Send size={16} /> Publish Results to Parents
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
