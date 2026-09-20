import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import AboutUs from "../pages/AboutUs";
import Courses from "../pages/Courses";
import Blog from "../pages/Blog";
import Teachers from "../pages/Teachers";
import IndividualCourse from "../pages/IndividualCourse";
import SignUp from "../pages/singup";
import Admin from "../pages/Admin";
import TeacherDashboard from "../pages/TeacherDashboard";
import ParentDashboard from "../pages/ParentDashboard";
import StudentDashboard from "../pages/StudentDashboard";

function AllRoutes() {
  return (
    <Routes>
      {/* Public Discovery Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<IndividualCourse />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/blogs" element={<Blog />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Role-Based Operational Dashboards */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/parent" element={<ParentDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
    </Routes>
  );
}

export default AllRoutes;