# Success Mentor — Administration Suite & Dynamic Navbar Master Plan

This plan outlines the complete architecture, navigation redesign, and feature set for the **Institute Administration Suite (`/admin`)** and the **Dynamic Role-Based Navbar Navigation**.

---

## 1. Executive Summary & Goals

The goal is to deliver an **Institute Administration Suite** tailored for coaching center owners and admins, while eliminating static, unauthenticated navigation states once an Admin is logged in.

### Key Objectives:
1. **Dynamic Navbar State Transition**:
   - Seamlessly switch from the public marketing navbar to an **Admin Management Hub** upon login.
   - Display active module tabs, live pending admission badge alerts, admin profile metadata, and a quick switch to "View Public Website".
2. **Comprehensive 7-Module Administration Suite**:
   - **Module 1: Executive Command Center (Overview)** — Real-time KPIs, live running batches schedule, quick action bar.
   - **Module 2: Inbound Admissions & Inquiries Pipeline** — Class 1–10 filtering, status tracking, direct contact triggers, 1-click batch assignment and automatic onboarding.
   - **Module 3: Batches & Timetable Manager** — Visual batch cards with capacity gauges, timetable schedule chips, and `+ Create New Batch` modal.
   - **Module 4: Students & Parents Directory** — Searchable roster with attendance rates, enrolled batches, fee indicators, and parent contacts.
   - **Module 5: Faculty & Mentors Directory** — Teacher profiles, assigned classes (Classes 1–5 & 6–10), specializations, and `+ Add Teacher` modal.
   - **Module 6: CBSE Classes & Syllabus Progress Monitor** — Class 1–10 subject hierarchies with real-time chapter completion tracking.
   - **Module 7: Institute Profile & Settings** — Manage institute contact info, classes offered, and fee policies.
3. **Strict Design & CSS Consistency**:
   - Exact theme tokens: Deep Slate/Navy (`#304b62`), Warm Accent Gold (`#d49539`, `#f6d6a0`), Crisp White & Slate (`#f8fafc`, `#f1f5f9`), Emerald Green (`#059669`), Ruby Red (`#e11d48`).

---

## 2. Dynamic Navigation States

```
Guest / Unauthenticated View:
[Logo: Success Mentor]  |  [Home]  [Courses & Classes]  [Faculty]  [About Us]  |  [Log In]  [Admission Now (Modal)]

Admin Authenticated View:
Top Tier:
[Logo: Success Mentor • Apex Academy]  |  [🌐 View Public Site]  |  [🔔 Inquiries Badge (3)]  [Admin Profile (Sharma Admin)]  [Log Out]

Sub-Nav Bar (Sticky Admin Hub):
[📊 Overview]  [📥 Inquiries (3)]  [📅 Batches & Timetable]  [👥 Students & Parents]  [🎓 Faculty & Mentors]  [📚 Syllabus Tracker]  [⚙️ Settings]
```

---

## 3. Detailed Administration Modules

### Module 1: Executive Command Center (Overview)
- **Top 4 KPI Metrics**:
  - `Total Enrolled Students` (Live count across all batches)
  - `Active Batches` (Classes 1 to 10)
  - `Pending Admissions` (Inbound inquiries awaiting review)
  - `Today's Average Attendance %` (Institute-wide check-in rate)
- **Live Classroom Feed**: Batches currently active today (Junior Rooms, Senior Rooms, start/end times).
- **Quick Action Bar**: `+ Create Batch`, `+ Onboard Teacher`, `+ Manual Admission`, `+ View Reports`.

### Module 2: Inbound Admissions & Inquiries Pipeline
- **Class 1–10 Filter Chips**: Filter inquiries by grade.
- **Inquiry Details**: Student name, school, parent name, phone number, address, preferred timing.
- **1-Click Batch Approval**: Dropdown with available batches for that grade; clicking Approve creates the Student, Parent, and Enrollment records and issues login credentials.
- **Direct Phone & WhatsApp Links**: 1-click communication for institute staff.

### Module 3: Batches & Timetable Manager
- **Batch Cards**: Displays Class, Subject IDs, Assigned Teacher, Days of Week, Timing, Room, and Enrolled Capacity (`14/20 filled`).
- **Interactive `+ Create New Batch` Modal**: Select Class 1-10, pick teachers, set weekly days (MON-SAT), time slots, and room.

### Module 4: Students & Parents Directory
- **Live Search**: Search by student name, class, roll number, or parent mobile.
- **Roster Table**: Student Name, Class, Enrolled Batch, Parent Contact, Overall Attendance %, and Status.
- **Actions**: View profile, change batch, contact parent.

### Module 5: Faculty & Mentors Directory
- Complete cards for all dedicated Primary Mentors (Classes 1–5) and Secondary Teachers.
- Displays qualifications, specializations, assigned classes, and student ratings.
- `+ Add Teacher` modal for onboarding new faculty.

### Module 6: Classes & Syllabus Progress Monitor
- High-level overview of Classes 1 to 10.
- Subject breakdown (Mathematics, Science, EVS, English, Hindi).
- Real-time syllabus completion % with toggle controls for completed/in-progress chapters.

### Module 7: Institute Profile & Settings
- Apex Academy contact details, address, logo, banner, and operating policies.

---

## 4. Implementation Steps

1. **Step 1: Update Navbar Component (`src/Components/Navbar.jsx`)**:
   - Add role detection for `ADMIN` / `SUPER_ADMIN`.
   - Render the Admin Command Bar with module tabs, live pending inquiries badge, and "View Public Site" switcher.
2. **Step 2: Build Reusable Modals (`CreateBatchModal.jsx`, `AddTeacherModal.jsx`)**:
   - Clean, validated popup dialogs styled with the existing theme.
3. **Step 3: Upgrade Admin Page (`src/pages/Admin.jsx`)**:
   - Implement the full 7-module dashboard with interactive state management, live searches, and filter chips.
4. **Step 4: Backend API Verification**:
   - Ensure endpoints for batch creation, student directory retrieval, and enrollment approval are verified.
5. **Step 5: End-to-End Build & Validation**:
   - Run `npm run build` to ensure 0 errors and test the complete workflow.
