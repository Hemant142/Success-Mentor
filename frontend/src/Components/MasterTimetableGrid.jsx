import React, { useState, useMemo } from "react";
import {
  Clock,
  Building,
  GraduationCap,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Edit2,
  Sparkles,
} from "lucide-react";
import { timeToMinutes, normalizeDay } from "../utils/timetableConflictEngine";

const DAYS = [
  { key: "MON", label: "Monday", short: "Mon" },
  { key: "TUE", label: "Tuesday", short: "Tue" },
  { key: "WED", label: "Wednesday", short: "Wed" },
  { key: "THU", label: "Thursday", short: "Thu" },
  { key: "FRI", label: "Friday", short: "Fri" },
  { key: "SAT", label: "Saturday", short: "Sat" },
];

const MasterTimetableGrid = ({
  batches = [],
  teachers = [],
  onEditBatch,
  onCreateBatch,
  onMarkAttendance,
}) => {
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("ALL");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState("ALL");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");

  // Extract all distinct rooms from all batches
  const availableRooms = useMemo(() => {
    const roomsSet = new Set(["Room 101", "Room 102", "Junior Room 1", "Junior Room 2", "Science Lab"]);
    (batches || []).forEach((b) => {
      (b.schedule || []).forEach((s) => {
        if (s.room) roomsSet.add(s.room.trim());
      });
    });
    return Array.from(roomsSet);
  }, [batches]);

  // Compute all scheduled slots grouped by day
  const scheduleByDay = useMemo(() => {
    const map = {
      MON: [],
      TUE: [],
      WED: [],
      THU: [],
      FRI: [],
      SAT: [],
    };

    (batches || []).forEach((batch) => {
      // Filter by class if selected
      if (selectedClassFilter !== "ALL" && batch.class_number !== Number(selectedClassFilter)) {
        return;
      }

      // Filter by teacher if selected
      if (selectedTeacherFilter !== "ALL") {
        const teacherIds = (batch.teacher_ids || []).map((t) => (t?._id || t)?.toString());
        if (!teacherIds.includes(selectedTeacherFilter)) {
          return;
        }
      }

      const assignedTeacherName = batch.teacher_ids && batch.teacher_ids.length > 0
        ? (batch.teacher_ids[0]?.name || "Assigned Mentor")
        : "Primary Mentor";

      const scheduleItems = Array.isArray(batch.schedule) ? batch.schedule : [];

      scheduleItems.forEach((item) => {
        const itemDays = Array.isArray(item.days)
          ? item.days
          : item.day
          ? [item.day]
          : ["MON", "WED", "FRI"];

        itemDays.forEach((rawDay) => {
          const dayKey = normalizeDay(rawDay);
          if (map[dayKey]) {
            // Filter by room if selected
            if (selectedRoomFilter !== "ALL" && (item.room || "Room 101").trim() !== selectedRoomFilter) {
              return;
            }

            map[dayKey].push({
              batchId: batch._id,
              batchName: batch.name,
              classNumber: batch.class_number,
              monthlyFee: batch.monthly_fee,
              maxCapacity: batch.max_capacity || 25,
              studentCount: (batch.student_ids || []).length,
              teacherName: assignedTeacherName,
              teacherId: batch.teacher_ids?.[0]?._id || batch.teacher_ids?.[0],
              startTime: item.start_time || "16:00",
              endTime: item.end_time || "17:15",
              room: item.room || "Room 101",
              rawBatch: batch,
            });
          }
        });
      });
    });

    // Sort slots by start time inside each day
    Object.keys(map).forEach((dayKey) => {
      map[dayKey].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });

    return map;
  }, [batches, selectedClassFilter, selectedTeacherFilter, selectedRoomFilter]);

  // Detect collisions in the active schedule
  const collisionCount = useMemo(() => {
    let count = 0;
    Object.keys(scheduleByDay).forEach((dayKey) => {
      const slots = scheduleByDay[dayKey];
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const s1 = slots[i];
          const s2 = slots[j];
          if (s1.batchId !== s2.batchId) {
            const start1 = timeToMinutes(s1.startTime);
            const end1 = timeToMinutes(s1.endTime);
            const start2 = timeToMinutes(s2.startTime);
            const end2 = timeToMinutes(s2.endTime);
            const overlap = start1 < end2 && start2 < end1;
            if (overlap && (s1.room === s2.room || s1.teacherId === s2.teacherId)) {
              count++;
            }
          }
        }
      }
    });
    return count;
  }, [scheduleByDay]);

  const totalSessionsCount = Object.values(scheduleByDay).reduce((acc, list) => acc + list.length, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Filter & Conflict Status Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#d49539]/15 text-[#304b62] px-3 py-1 rounded-full text-xs font-bold mb-1.5">
              <Sparkles size={13} className="text-[#d49539]" /> Smart Timetable Matrix & Collision Engine
            </div>
            <h2 className="text-xl font-extrabold text-[#304b62]">
              Institute Master Timetable Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Weekly schedule overview across all classrooms, grade levels (Classes 1–10), and faculty mentors ({totalSessionsCount} active weekly sessions).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {collisionCount > 0 ? (
              <div className="bg-amber-50 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <span>{collisionCount} Potential Overlap(s) Detected</span>
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Timetable 100% Conflict-Free</span>
              </div>
            )}

            <button
              onClick={onCreateBatch}
              className="px-4 py-2 bg-[#304b62] hover:bg-[#253b4e] text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus size={15} /> + Schedule New Batch
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Filter by Classroom / Room:
            </label>
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
            >
              <option value="ALL">All Classrooms & Labs ({availableRooms.length})</option>
              {availableRooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Filter by Educator / Mentor:
            </label>
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
            >
              <option value="ALL">All Faculty Mentors ({(teachers || []).length})</option>
              {(teachers || []).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.primary_subject || "Mentor"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Filter by Grade Level:
            </label>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#304b62] focus:ring-2 focus:ring-[#d49539] outline-none"
            >
              <option value="ALL">All Classes (1 to 10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  Class {num} Batches
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timetable Grid Matrix: 6 Columns for Monday to Saturday */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {DAYS.map((day) => {
          const daySlots = scheduleByDay[day.key] || [];

          return (
            <div
              key={day.key}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[480px]"
            >
              {/* Day Column Header */}
              <div className="bg-[#304b62] text-white p-3.5 text-center flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm">{day.label}</h3>
                  <span className="text-[10px] text-[#f6d6a0] font-bold block">
                    {daySlots.length} Session{daySlots.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs text-[#d49539]">
                  {day.short}
                </span>
              </div>

              {/* Day Slots List */}
              <div className="p-3 flex-1 space-y-3 bg-slate-50/50 overflow-y-auto">
                {daySlots.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                    <Clock size={24} className="opacity-40" />
                    <span className="text-xs font-semibold">No classes scheduled</span>
                    <button
                      onClick={onCreateBatch}
                      className="text-[11px] font-bold text-[#d49539] hover:underline"
                    >
                      + Add Batch
                    </button>
                  </div>
                ) : (
                  daySlots.map((slot, idx) => {
                    const fillPct = Math.round((slot.studentCount / slot.maxCapacity) * 100);

                    // Check if this slot has a conflict with another slot in the same day
                    const isConflicting = daySlots.some((other, otherIdx) => {
                      if (idx === otherIdx || slot.batchId === other.batchId) return false;
                      const s1 = timeToMinutes(slot.startTime);
                      const e1 = timeToMinutes(slot.endTime);
                      const s2 = timeToMinutes(other.startTime);
                      const e2 = timeToMinutes(other.endTime);
                      const overlap = s1 < e2 && s2 < e1;
                      return overlap && (slot.room === other.room || slot.teacherId === other.teacherId);
                    });

                    return (
                      <div
                        key={`${slot.batchId}-${idx}`}
                        className={`p-3.5 rounded-2xl bg-white border transition-all duration-200 hover:shadow-md space-y-2.5 ${
                          isConflicting
                            ? "border-red-400 ring-2 ring-red-200/60 bg-red-50/20"
                            : "border-slate-200 hover:border-[#d49539]"
                        }`}
                      >
                        {/* Time & Class Badge */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#304b62] bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                            <Clock size={11} className="text-[#d49539]" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="bg-[#304b62] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            C-{slot.classNumber}
                          </span>
                        </div>

                        {/* Batch Name */}
                        <div>
                          <h4 className="font-extrabold text-xs text-[#304b62] line-clamp-1">
                            {slot.batchName}
                          </h4>
                        </div>

                        {/* Room & Teacher Details */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Building size={12} className="text-[#304b62] shrink-0" />
                            <span className="truncate font-semibold">{slot.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <GraduationCap size={12} className="text-[#d49539] shrink-0" />
                            <span className="truncate font-medium">{slot.teacherName}</span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>Capacity</span>
                            <span>{slot.studentCount}/{slot.maxCapacity}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#d49539] rounded-full"
                              style={{ width: `${Math.min(fillPct, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Conflict Alert Flag */}
                        {isConflicting && (
                          <div className="text-[10px] font-bold text-red-700 bg-red-100 p-1.5 rounded-lg flex items-center gap-1">
                            <AlertTriangle size={12} className="shrink-0" />
                            <span>Room/Teacher Collision!</span>
                          </div>
                        )}

                        {/* Quick Edit Trigger */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => onEditBatch && onEditBatch(slot.rawBatch)}
                            className="flex-1 py-1 px-2 bg-slate-50 hover:bg-[#304b62] hover:text-white rounded-lg text-[10px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit2 size={11} /> Edit Slot
                          </button>
                          <button
                            onClick={() => onMarkAttendance && onMarkAttendance(slot.batchId)}
                            className="py-1 px-2 bg-[#d49539]/10 hover:bg-[#d49539] hover:text-white rounded-lg text-[10px] font-bold text-[#d49539] transition-colors"
                            title="Mark Attendance"
                          >
                            Attend
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasterTimetableGrid;
