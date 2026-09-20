# Success Mentor — Complete REST API Documentation & cURL Guide

This document provides complete, copy-paste ready documentation and cURL commands for every API in **Success Mentor**.

> [!TIP]
> **Postman Collection Available**:
> You can directly import the file [`backend/POSTMAN_COLLECTION.json`](file:///d:/Project/Success-Mentor/backend/POSTMAN_COLLECTION.json) into Postman (**File $\rightarrow$ Import**). It includes pre-configured environment variables, request bodies, and auto-token management scripts.

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@successmentor.com` | `adminpassword123` | Coaching Owner / Administrator |
| **Teacher** | `rajesh@successmentor.com` | `teacherpassword123` | Class 9-10 Maths & Science Mentor |
| **Parent** | `parent@successmentor.com` | `parentpassword123` | Sunita Sharma (Mother of Aarav & Ananya) |
| **Student** | `aarav@successmentor.com` | `studentpassword123` | Aarav Sharma (Class 9 CBSE) |

- **Base URL**: `http://localhost:8080/api`

---

## 1. Authentication APIs

### 1.1 Multi-Role User Login
Authenticates Admin, Teacher, Parent, or Student and returns a signed JWT token.

- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@successmentor.com",
    "password": "adminpassword123"
  }
  ```
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"admin@successmentor.com\",\"password\":\"adminpassword123\"}"
  ```
- **Sample Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Welcome back, Sharma Coaching Admin!",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "68cd...",
        "name": "Sharma Coaching Admin",
        "email": "admin@successmentor.com",
        "phone": "9876543210",
        "role": "ADMIN",
        "institute_id": "68cd..."
      },
      "profile": { ... }
    }
  }
  ```

---

### 1.2 Get Authenticated Profile (`/me`)
Returns the logged-in user's profile with role-specific population (e.g. linked children for Parent, assigned batches for Teacher).

- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/auth/me \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```

---

### 1.3 Register New Institute + Admin
Onboards a new coaching center and provisions the Admin account in one step.

- **Method**: `POST`
- **Endpoint**: `/api/auth/register-institute`
- **Request Body**:
  ```json
  {
    "institute_name": "Excel Coaching Center",
    "admin_name": "Vikram Malhotra",
    "email": "vikram@excelcoaching.com",
    "phone": "9876543299",
    "password": "adminpassword123",
    "city": "Delhi NCR"
  }
  ```
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/auth/register-institute \
    -H "Content-Type: application/json" \
    -d "{\"institute_name\":\"Excel Coaching Center\",\"admin_name\":\"Vikram Malhotra\",\"email\":\"vikram@excelcoaching.com\",\"phone\":\"9876543299\",\"password\":\"adminpassword123\",\"city\":\"Delhi NCR\"}"
  ```

---

## 2. Public Discovery & Admission Inquiries (No Auth Required)

### 2.1 Get All Classes (Classes 1 to 10)
- **Method**: `GET`
- **Endpoint**: `/api/public/classes`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/public/classes
  ```

---

### 2.2 Get Subjects (with optional `class_id` filter)
- **Method**: `GET`
- **Endpoint**: `/api/public/subjects?class_id=class_10`
- **cURL Request**:
  ```bash
  curl -X GET "http://localhost:8080/api/public/subjects?class_id=class_10"
  ```

---

### 2.3 Get Class 10 Full Details & Syllabus Accordion
- **Method**: `GET`
- **Endpoint**: `/api/public/courses/class_10`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/public/courses/class_10
  ```

---

### 2.4 Get Faculty / Teachers Directory
- **Method**: `GET`
- **Endpoint**: `/api/public/teachers`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/public/teachers
  ```

---

### 2.5 Submit Public Admission Inquiry
Allows prospective parents to apply online.

- **Method**: `POST`
- **Endpoint**: `/api/public/enroll`
- **Request Body**:
  ```json
  {
    "parent_name": "Manoj Gupta",
    "parent_phone": "9871234567",
    "parent_email": "manoj.gupta@example.com",
    "parent_address": "Sector 15, Block C",
    "student_name": "Rohan Gupta",
    "student_class": 10,
    "school_name": "Delhi Public School",
    "preferred_batch_timing": "EVENING",
    "remarks": "Interested in Class 10 Maths & Science batch"
  }
  ```
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/public/enroll \
    -H "Content-Type: application/json" \
    -d "{\"parent_name\":\"Manoj Gupta\",\"parent_phone\":\"9871234567\",\"parent_email\":\"manoj.gupta@example.com\",\"parent_address\":\"Sector 15\",\"student_name\":\"Rohan Gupta\",\"student_class\":10,\"school_name\":\"DPS\",\"preferred_batch_timing\":\"EVENING\"}"
  ```

---

## 3. Admin Inquiry Pipeline & Batch Operations

### 3.1 Get All Inbound Inquiries
- **Method**: `GET`
- **Endpoint**: `/api/enrollments?status=PENDING`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **cURL Request**:
  ```bash
  curl -X GET "http://localhost:8080/api/enrollments?status=PENDING" \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
  ```

---

### 3.2 1-Click Approve Inquiry & Auto-Enroll Student to Batch
Auto-creates Student user, links Parent account, generates credentials, and assigns student to the batch.

- **Method**: `PATCH`
- **Endpoint**: `/api/enrollments/:inquiryId/approve`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Request Body**:
  ```json
  {
    "batch_id": "BATCH_OBJECT_ID",
    "remarks": "Approved and admitted to Class 10 Evening Batch"
  }
  ```
- **cURL Request**:
  ```bash
  curl -X PATCH http://localhost:8080/api/enrollments/INQUIRY_ID_HERE/approve \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"batch_id\":\"BATCH_ID\",\"remarks\":\"Approved\"}"
  ```

---

### 3.3 Create New Coaching Batch
- **Method**: `POST`
- **Endpoint**: `/api/batches`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Request Body**:
  ```json
  {
    "name": "Class 10 - Mathematics Weekend Champions",
    "class_number": 10,
    "subject_ids": ["class_10_subject_3"],
    "monthly_fee": 3200,
    "max_capacity": 25,
    "schedule": [
      {
        "day": "SAT",
        "start_time": "09:00",
        "end_time": "11:00",
        "room": "Room 101"
      },
      {
        "day": "SUN",
        "start_time": "09:00",
        "end_time": "11:00",
        "room": "Room 101"
      }
    ]
  }
  ```
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/batches \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Class 10 - Mathematics Weekend Champions\",\"class_number\":10,\"subject_ids\":[\"class_10_subject_3\"],\"monthly_fee\":3200,\"schedule\":[{\"day\":\"SAT\",\"start_time\":\"09:00\",\"end_time\":\"11:00\"}]}"
  ```

---

## 4. Teacher Daily Workflow (Attendance, Syllabus, Exams)

### 4.1 Save Batch Session Attendance (with Timestamps)
- **Method**: `POST`
- **Endpoint**: `/api/attendance/mark`
- **Headers**: `Authorization: Bearer <TEACHER_TOKEN>`
- **Request Body**:
  ```json
  {
    "batch_id": "BATCH_OBJECT_ID",
    "date": "2026-09-19",
    "subject_id": "class_9_subject_3",
    "topic_covered": "Quadratic Equations: Nature of Roots",
    "records": [
      {
        "student_id": "STUDENT_OBJECT_ID",
        "status": "PRESENT",
        "check_in_time": "16:58",
        "remarks": "Active in solving quadratic formula problems"
      }
    ]
  }
  ```
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/attendance/mark \
    -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"batch_id\":\"BATCH_ID\",\"date\":\"2026-09-19\",\"topic_covered\":\"Quadratic Equations\",\"records\":[{\"student_id\":\"STUDENT_ID\",\"status\":\"PRESENT\",\"check_in_time\":\"16:58\"}]}"
  ```

---

### 4.2 Toggle Syllabus Topic Completion (1-Tap Progress)
- **Method**: `PATCH`
- **Endpoint**: `/api/syllabus/subject/class_10_subject_3/topic`
- **Headers**: `Authorization: Bearer <TEACHER_TOKEN>`
- **Request Body**:
  ```json
  {
    "topicName": "Nature of Roots",
    "is_completed": true
  }
  ```
- **cURL Request**:
  ```bash
  curl -X PATCH http://localhost:8080/api/syllabus/subject/class_10_subject_3/topic \
    -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"topicName\":\"Nature of Roots\",\"is_completed\":true}"
  ```

---

### 4.3 Create Unit Test
- **Method**: `POST`
- **Endpoint**: `/api/exams`
- **Headers**: `Authorization: Bearer <TEACHER_TOKEN>`
- **Request Body**:
  ```json
  {
    "batch_id": "BATCH_OBJECT_ID",
    "subject_id": "class_9_subject_3",
    "title": "Class 9 Unit Test 2 - Algebraic Identities",
    "exam_date": "2026-09-22",
    "total_marks": 50,
    "passing_marks": 18,
    "syllabus_topics": ["Polynomials", "Factorization"]
  }
  ```
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/exams \
    -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"batch_id\":\"BATCH_ID\",\"subject_id\":\"class_9_subject_3\",\"title\":\"Unit Test 2\",\"exam_date\":\"2026-09-22\",\"total_marks\":50}"
  ```

---

### 4.4 Submit & Publish Test Results
- **Method**: `POST`
- **Endpoint**: `/api/exams/:examId/results`
- **Headers**: `Authorization: Bearer <TEACHER_TOKEN>`
- **Request Body**:
  ```json
  {
    "results": [
      {
        "student_id": "STUDENT_OBJECT_ID",
        "marks_obtained": 47,
        "is_absent": false,
        "remarks": "Excellent conceptual clarity and step-wise accuracy"
      }
    ]
  }
  ```
- **cURL Request**:
  ```bash
  curl -X POST http://localhost:8080/api/exams/EXAM_ID_HERE/results \
    -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"results\":[{\"student_id\":\"STUDENT_ID\",\"marks_obtained\":47,\"remarks\":\"Excellent work\"}]}"
  ```

---

## 5. Parent Real-Time Visibility & Multi-Child Portal

### 5.1 Get Linked Children List (For Sibling Switcher)
- **Method**: `GET`
- **Endpoint**: `/api/parent/children`
- **Headers**: `Authorization: Bearer <PARENT_TOKEN>`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/parent/children \
    -H "Authorization: Bearer YOUR_PARENT_TOKEN"
  ```

---

### 5.2 Get Child 360-Degree Overview (Today Status + Syllabus % + Tests)
- **Method**: `GET`
- **Endpoint**: `/api/parent/child/:studentId/overview`
- **Headers**: `Authorization: Bearer <PARENT_TOKEN>`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/parent/child/STUDENT_ID_HERE/overview \
    -H "Authorization: Bearer YOUR_PARENT_TOKEN"
  ```

---

### 5.3 Get Child Live Today Check-in Status
- **Method**: `GET`
- **Endpoint**: `/api/attendance/student/:studentId/today`
- **Headers**: `Authorization: Bearer <PARENT_TOKEN>`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/attendance/student/STUDENT_ID_HERE/today \
    -H "Authorization: Bearer YOUR_PARENT_TOKEN"
  ```

---

### 5.4 Get Child Unit Test Scorecards & Feedback
- **Method**: `GET`
- **Endpoint**: `/api/exams/student/:studentId/results`
- **Headers**: `Authorization: Bearer <PARENT_TOKEN>`
- **cURL Request**:
  ```bash
  curl -X GET http://localhost:8080/api/exams/student/STUDENT_ID_HERE/results \
    -H "Authorization: Bearer YOUR_PARENT_TOKEN"
  ```

---

## 🧪 Quick Postman Import Instructions

1. Open **Postman**.
2. Click **Import** (top left).
3. Select or drag-and-drop the file: `d:\Project\Success-Mentor\backend\POSTMAN_COLLECTION.json`.
4. Open the collection in Postman:
   - Run **"1. Authentication $\rightarrow$ Login - Admin"** (or Teacher / Parent).
   - Postman will **automatically extract and store the JWT Token** in collection variables (`{{adminToken}}`, `{{teacherToken}}`, `{{parentToken}}`).
   - You can now test any endpoint in the collection with 1 click!
