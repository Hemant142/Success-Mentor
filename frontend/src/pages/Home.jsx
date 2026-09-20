import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Send,
} from "lucide-react";
import bannernew from "../images/bannernew.png";
import EnrollmentModal from "../Components/EnrollmentModal";

const Home = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass] = useState(10);

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#f6d6a0]/40 to-slate-50 py-12 md:py-16 px-4 md:px-8 lg:px-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Text */}
          <div className="flex-1 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#d49539]/20 text-[#304b62] px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold tracking-wide">
              <Sparkles size={16} className="text-[#d49539]" /> Dedicated Coaching for Classes 1 to 10
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#304b62] leading-tight tracking-tight">
              Bridging the Visibility Gap in <span className="text-[#d49539]">Smart Coaching</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              Empowering local coaching institutes and parents with real-time arrival check-in alerts, verified CBSE syllabus completion tracking, and periodic scorecard analytics.
            </p>

            {/* Quick Class Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Select Child's Class to Explore:
              </span>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => navigate(`/courses`)}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#304b62] hover:text-white text-[#304b62] font-bold text-xs rounded-lg border border-slate-300 shadow-sm transition-all"
                  >
                    Class {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#d49539] hover:bg-[#c0832d] text-white font-extrabold py-3.5 px-8 rounded-xl shadow-lg transition-all text-sm md:text-base flex items-center gap-2"
              >
                <Send size={18} /> Apply for Admission
              </button>

              <button
                onClick={() => navigate("/courses")}
                className="bg-[#304b62] hover:bg-[#253b4e] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors text-sm md:text-base flex items-center gap-2"
              >
                <BookOpen size={18} /> Browse Batches & Syllabus
              </button>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-[320px] sm:w-[420px] md:w-[480px] rounded-3xl bg-[#f6d6a0] p-6 border-4 border-white shadow-2xl overflow-hidden">
                <img
                  src={bannernew}
                  alt="Students learning"
                  className="w-full h-auto object-contain drop-shadow-md"
                />
              </div>

              {/* Floating Stat Pill */}
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Real-Time Parent Alert</div>
                  <div className="text-sm font-extrabold text-[#304b62]">🟢 Student Checked In: 4:58 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-[#d49539] uppercase tracking-wider">
            Why Parents & Institutes Choose Success Mentor
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#304b62]">
            Complete Transparency for Every Child
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#304b62] text-[#d49539] flex items-center justify-center font-black">
              <Clock size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-[#304b62]">1. Real-Time Check-In Attendance</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Parents never have to wonder if their child reached coaching safely. Teachers record single-click attendance with instant timestamp verification.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#304b62] text-[#d49539] flex items-center justify-center font-black">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-[#304b62]">2. Verified CBSE Syllabus Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No more black boxes. Track exactly which chapters and topics have been completed, what is scheduled for this week, and how much of the curriculum is done.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#304b62] text-[#d49539] flex items-center justify-center font-black">
              <Award size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-[#304b62]">3. Test Scorecards & Feedback</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Weekly unit test marks, percentage benchmarks, batch comparisons, and constructive teacher remarks delivered straight to the parent dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Global Admission Modal */}
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedClass={selectedClass}
        preselectedCourse={`Class ${selectedClass} Comprehensive Coaching`}
      />
    </div>
  );
};

export default Home;
