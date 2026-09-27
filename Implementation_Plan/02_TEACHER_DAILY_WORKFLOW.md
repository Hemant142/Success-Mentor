# Flow 2: Teacher Daily Workflow & Syllabus Progress (End-to-End Flow)

## 1. Flow Overview & Objective
This flow provides a friction-free daily workflow for teachers to view their schedule, take fast 1-click batch attendance with timestamps, mark completed syllabus topics in real-time, and publish unit test marks.

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Rajesh Sir (Teacher)
    participant UI as Teacher Portal (Web)
    participant API as Backend REST API
    participant DB as MongoDB Atlas

    Teacher->>UI: Login with Phone/Email & Password
    UI->>API: POST /api/auth/login
    API-->>UI: Return JWT Token & Teacher Profile
    Teacher->>UI: View "Today's Batches" (e.g. 5:00 PM Class 10 Maths Alpha)
    
    rect rgb(240, 248, 255)
    Note over Teacher,DB: Step 1: Batch Attendance
    Teacher->>UI: Open Attendance Sheet for Batch
    UI->>API: GET /api/batches/:id/students
    API-->>UI: Return student roster with avatars
    Teacher->>UI: Mark Status (Present/Absent/Late) & Check-in timestamp -> Click "Save Attendance"
    UI->>API: POST /api/attendance/mark
    API->>DB: Save Attendance document for batch & date
    API-->>UI: Return Success Confirmation
    end

    rect rgb(255, 250, 240)
    Note over Teacher,DB: Step 2: Syllabus Progress Update
    Teacher->>UI: Navigate to "Syllabus Tracker"
    UI->>API: GET /api/syllabus/subject/:subjectId
    API-->>UI: Return Chapter Tree (Quadratic Equations, etc.)
    Teacher->>UI: Check "Nature of Roots" -> Click "Mark as Completed"
    UI->>API: PATCH /api/syllabus/topics/:topicId
    API->>DB: Update topic is_completed=true, completed_at, teacher_id
    API-->>UI: Return updated progress percentage (e.g., 55% -> 60%)
    end

    rect rgb(245, 255, 245)
    Note over Teacher,DB: Step 3: Test & Marks Entry
    Teacher->>UI: Create "Class 10 Unit Test 1" (Max Marks: 50)
    Teacher->>UI: Enter Student Marks and Remarks in Grid
    Teacher->>UI: Click "Publish Results"
    UI->>API: POST /api/exams/:id/results
    API->>DB: Save Results + calculate percentage & class average
    API-->>UI: Return Published confirmation
    end
```

---

## 2. Backend Components for Flow 2

### 2.1 Database Models Needed
- `Model/People/Teacher.js`: Teacher profile, qualifications, assigned batches.
- `Model/People/Batch.js`: Batch details, enrolled students, daily schedule.
- `Model/People/Attendance.js`: Date-wise student check-in/out, status (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`), topic taught.
- `Model/Academic/Syllabus.js`: Chapter and topic hierarchy with completion state.
- `Model/Academic/Exam.js` & `Result.js`: Test definition, max marks, student score records, teacher remarks.

### 2.2 REST API Endpoints
1. `GET /api/teacher/my-batches`: Returns assigned batches, enrolled student count, and today's schedule.
2. `GET /api/batches/:id/students`: Returns enrolled student roster for the batch.
3. `POST /api/attendance/mark`: Records batch session attendance with timestamps and topic covered.
4. `GET /api/syllabus/subject/:subjectId`: Returns full chapters, topics, and completion status.
5. `PATCH /api/syllabus/topics/:topicId`: Marks topic completed/uncompleted with teacher ID and date.
6. `POST /api/exams`: Creates an exam for a batch.
7. `POST /api/exams/:id/results`: Bulk records student marks, absentee flags, and individual teacher remarks.

---

## 3. Frontend Components for Flow 2

### 3.1 Teacher Dashboard Views (`src/pages/TeacherDashboard.jsx`)
1. **Today's Classes Widget**: Quick launch cards for upcoming classes today with start time, room number, and batch size.
2. **1-Click Attendance Sheet (`src/Components/AttendanceSheet.jsx`)**:
   - Table of students with roll numbers and photos.
   - Quick toggles: `Present (P)`, `Absent (A)`, `Late (L)`, `Excused (E)`.
   - Automatic check-in time recorder (default: current time).
   - "Topic Covered Today" input field.
   - "Submit Batch Attendance" button with instant toast notification.
3. **Syllabus Tracker (`src/Components/SyllabusTracker.jsx`)**:
   - Expandable chapters with nested topic checklists.
   - 1-click checkbox to mark topics completed.
   - Live visual progress bar (e.g. 14 of 22 topics completed - 64%).
4. **Test Score Entry Table (`src/Components/TestScoreEntry.jsx`)**:
   - Spreadsheet-style input for fast score entry out of total marks.
   - Optional teacher remark field (e.g. "Excellent problem solving in geometry").
   - 1-click "Publish to Parents" button.
