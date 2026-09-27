/**
 * Timetable Schedule Conflict Detection Engine
 * 
 * Accurately detects:
 * 1. Teacher Double-Booking (same educator assigned to 2 batches at overlapping times)
 * 2. Room Double-Booking (same classroom booked for 2 batches at overlapping times)
 */

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  
  // Clean string
  const str = timeStr.trim();
  
  // Format "HH:mm" (24-hour)
  if (str.includes(":")) {
    const parts = str.split(":");
    let hours = parseInt(parts[0], 10) || 0;
    let minsPart = parts[1] || "0";
    
    // Check 12-hour AM/PM
    const isPM = /pm/i.test(minsPart);
    const isAM = /am/i.test(minsPart);
    const mins = parseInt(minsPart.replace(/[^0-9]/g, ""), 10) || 0;
    
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
    return hours * 60 + mins;
  }
  
  return 0;
};

export const formatMinutesTo12Hour = (minutes) => {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedMins = mins < 10 ? `0${mins}` : mins;
  return `${hours12}:${paddedMins} ${period}`;
};

export const normalizeDay = (day) => {
  if (!day) return "";
  const d = day.trim().toUpperCase();
  if (d.startsWith("MON")) return "MON";
  if (d.startsWith("TUE")) return "TUE";
  if (d.startsWith("WED")) return "WED";
  if (d.startsWith("THU")) return "THU";
  if (d.startsWith("FRI")) return "FRI";
  if (d.startsWith("SAT")) return "SAT";
  if (d.startsWith("SUN")) return "SUN";
  return d;
};

/**
 * Checks for time range overlap: [s1, e1] and [s2, e2]
 * Returns true if s1 < e2 and s2 < e1
 */
export const doTimeRangesOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  if (e1 <= s1 || e2 <= s2) return false;
  return s1 < e2 && s2 < e1;
};

/**
 * Main Conflict Detection Function
 */
export const detectScheduleConflicts = ({
  batchId = null,
  selectedDays = [],
  startTime = "16:00",
  endTime = "17:15",
  teacherId = null,
  teacherName = "",
  room = "",
  existingBatches = [],
  teachers = [],
}) => {
  const conflicts = [];
  
  if (!selectedDays || selectedDays.length === 0 || !startTime || !endTime) {
    return { hasConflict: false, conflicts: [] };
  }
  
  const normProposedDays = selectedDays.map(normalizeDay);
  const cleanRoom = (room || "").trim().toLowerCase();
  
  // Find teacher name if not passed
  let mentorName = teacherName;
  if (!mentorName && teacherId && teachers.length > 0) {
    const foundT = teachers.find((t) => (t._id || t.id) === (teacherId._id || teacherId));
    if (foundT) mentorName = foundT.name;
  }
  
  (existingBatches || []).forEach((otherBatch) => {
    // Exclude current batch when editing
    const otherBatchId = otherBatch._id || otherBatch.id;
    if (batchId && otherBatchId && String(otherBatchId) === String(batchId)) {
      return;
    }
    
    // Check if other batch is active
    if (otherBatch.status && otherBatch.status !== "ACTIVE") {
      return;
    }
    
    // Other batch teachers
    const otherTeacherIds = (otherBatch.teacher_ids || []).map((t) => (t?._id || t)?.toString());
    const isSameTeacher = teacherId && otherTeacherIds.includes((teacherId._id || teacherId)?.toString());
    
    const otherTeacherName = otherBatch.teacher_ids && otherBatch.teacher_ids.length > 0
      ? (otherBatch.teacher_ids[0]?.name || "Assigned Mentor")
      : "Assigned Mentor";
    
    const otherSchedule = Array.isArray(otherBatch.schedule) ? otherBatch.schedule : [];
    
    otherSchedule.forEach((slot) => {
      const otherDay = normalizeDay(slot.day || (Array.isArray(slot.days) ? slot.days[0] : ""));
      
      // If days match and times overlap
      if (normProposedDays.includes(otherDay)) {
        const otherStart = slot.start_time || "16:00";
        const otherEnd = slot.end_time || "17:15";
        
        if (doTimeRangesOverlap(startTime, endTime, otherStart, otherEnd)) {
          const otherRoom = (slot.room || "Room 101").trim();
          
          // 1. Check Room Collision
          if (cleanRoom && otherRoom.toLowerCase() === cleanRoom) {
            conflicts.push({
              type: "ROOM",
              day: otherDay,
              room: otherRoom,
              message: `Room Collision: "${otherRoom}" is already booked for "${otherBatch.name}" on ${otherDay} (${otherStart} - ${otherEnd}).`,
              conflictingBatch: otherBatch,
              timeRange: `${otherStart} - ${otherEnd}`,
            });
          }
          
          // 2. Check Teacher Collision
          if (isSameTeacher) {
            conflicts.push({
              type: "TEACHER",
              day: otherDay,
              teacher: mentorName || otherTeacherName,
              message: `Teacher Double-Booking: Mentor ${mentorName || otherTeacherName} is already teaching "${otherBatch.name}" in ${otherRoom} on ${otherDay} (${otherStart} - ${otherEnd}).`,
              conflictingBatch: otherBatch,
              timeRange: `${otherStart} - ${otherEnd}`,
            });
          }
        }
      }
    });
  });
  
  return {
    hasConflict: conflicts.length > 0,
    hasTeacherConflict: conflicts.some((c) => c.type === "TEACHER"),
    hasRoomConflict: conflicts.some((c) => c.type === "ROOM"),
    conflicts,
  };
};
