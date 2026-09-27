import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
  Inbox,
  Globe,
  LayoutDashboard,
  Calendar,
  UserCheck,
  Award,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
} from "lucide-react";
import { AuthContext } from "../Context/AuthContext";
import logo from "../images/logo.png";
import EnrollmentModal from "./EnrollmentModal";
import api from "../api/axios";

const Navbar = () => {
  const { isAuth, user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [pendingInquiriesCount, setPendingInquiriesCount] = useState(0);

  const isAdmin = isAuth && (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN");
  const isTeacher = isAuth && user?.role === "TEACHER";
  const isParent = isAuth && user?.role === "PARENT";
  const isStudent = isAuth && user?.role === "STUDENT";

  const queryParams = new URLSearchParams(location.search);
  const currentAdminTab = queryParams.get("tab") || "OVERVIEW";
  const isOnAdminPath = location.pathname.startsWith("/admin");

  // Fetch pending inquiries count for admin notification indicator
  useEffect(() => {
    if (isAdmin) {
      const fetchInquiryCount = async () => {
        try {
          const res = await api.get("/enrollments");
          if (res.data.success) {
            const pending = res.data.data.filter((e) => e.status === "PENDING").length;
            setPendingInquiriesCount(pending);
          }
        } catch (err) {
          // silent fallback
        }
      };
      fetchInquiryCount();
    }
  }, [isAdmin, location.pathname]);

  // Public Links (Guest view)
  const publicNavLinks = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses & Classes" },
    { to: "/teachers", label: "Faculty" },
    { to: "/about", label: "About Us" },
  ];

  // Admin Portal Tabs (Directly in Navbar)
  const adminNavTabs = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { id: "ENROLLMENTS", label: "Inquiries", icon: Inbox, badge: pendingInquiriesCount },
    { id: "BATCHES", label: "Batches", icon: Calendar },
    { id: "ATTENDANCE", label: "Attendance", icon: UserCheck },
    { id: "EXAMS", label: "Exams & Tests", icon: Award },
    { id: "STUDENTS", label: "Students", icon: Users },
    { id: "TEACHERS", label: "Faculty", icon: GraduationCap },
    { id: "CLASSES", label: "Syllabus", icon: BookOpen },
    { id: "SETTINGS", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate("/");
    setIsOpen(false);
  };

  const handleAdminTabClick = (tabId) => {
    navigate(`/admin?tab=${tabId}`);
    setIsOpen(false);
  };

  return (
    <>
      <header className="bg-[#d49539] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-2.5 flex items-center justify-between min-h-[78px]">
          {/* Logo & Institute Branding */}
          <div
            onClick={() => navigate(isAdmin ? "/admin?tab=OVERVIEW" : "/")}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <img
              src={logo}
              alt="Institute logo"
              className="h-[52px] object-contain transition-transform group-hover:scale-105"
            />
          </div>

          {/* Role-Aware Middle Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 overflow-x-auto py-1">
            {isAdmin ? (
              /* ADMIN LOGGED IN: Render Admin Tabs Similar to Public Links */
              adminNavTabs.map((tab) => {
                const isActive = isOnAdminPath && currentAdminTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleAdminTabClick(tab.id)}
                    className={`relative py-2 px-2.5 lg:px-3.5 font-bold text-xs lg:text-sm transition-colors flex items-center gap-1.5 shrink-0 ${
                      isActive ? "text-[#304b62] font-black" : "text-[#304b62]/85 hover:text-[#304b62]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-[-4px] left-0 right-0 h-[3.5px] bg-[#304b62] rounded-t-md" />
                    )}
                  </button>
                );
              })
            ) : isParent ? (
              /* PARENT LOGGED IN */
              <div className="flex items-center gap-2">
                <Link
                  to="/parent"
                  className="py-2 px-3 font-bold text-sm text-[#304b62] hover:bg-black/10 rounded-xl"
                >
                  Parent Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="py-2 px-3 font-bold text-sm text-[#304b62] hover:bg-black/10 rounded-xl"
                >
                  Courses
                </Link>
                <Link
                  to="/teachers"
                  className="py-2 px-3 font-bold text-sm text-[#304b62] hover:bg-black/10 rounded-xl"
                >
                  Faculty
                </Link>
              </div>
            ) : isTeacher ? (
              /* TEACHER LOGGED IN */
              <div className="flex items-center gap-2">
                <Link
                  to="/teacher"
                  className="py-2 px-3 font-bold text-sm text-[#304b62] hover:bg-black/10 rounded-xl"
                >
                  Teacher Portal
                </Link>
                <Link
                  to="/courses"
                  className="py-2 px-3 font-bold text-sm text-[#304b62] hover:bg-black/10 rounded-xl"
                >
                  Curriculum
                </Link>
              </div>
            ) : isStudent ? (
              /* STUDENT LOGGED IN */
              <div className="flex items-center gap-2">
                <Link
                  to="/student"
                  className="py-2 px-3 font-bold text-sm text-[#304b62] hover:bg-black/10 rounded-xl"
                >
                  Student Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="py-2 px-3 font-bold text-sm text-[#304b62] hover:bg-black/10 rounded-xl"
                >
                  My Subjects
                </Link>
              </div>
            ) : (
              /* GUEST / PUBLIC VIEW */
              publicNavLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    to={link.to}
                    key={link.to}
                    className={`relative py-2 px-3.5 font-bold text-sm lg:text-base transition-colors ${
                      isActive ? "text-[#304b62] font-black" : "text-[#304b62]/90 hover:text-[#304b62]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-[-4px] left-0 right-0 h-[3.5px] bg-[#304b62] rounded-t-md" />
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {isAuth ? (
              <div className="flex items-center gap-2">
                {/* Admin Quick Switcher to Public Website */}
                {isAdmin && (
                  <Link
                    to={isOnAdminPath ? "/courses" : "/admin?tab=OVERVIEW"}
                    title={isOnAdminPath ? "Preview Public Website" : "Return to Admin Command"}
                    className="p-2 bg-white/20 hover:bg-white/30 text-[#304b62] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Globe size={15} />
                    <span className="hidden lg:inline">
                      {isOnAdminPath ? "Public Site" : "Admin Hub"}
                    </span>
                  </Link>
                )}

                {/* User Profile Pill */}
                <div className="bg-[#304b62] text-white px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-sm">
                  {isAdmin ? (
                    <ShieldCheck size={15} className="text-[#d49539]" />
                  ) : (
                    <LayoutDashboard size={15} className="text-[#d49539]" />
                  )}
                  <div className="text-left">
                    <span className="block text-[9px] text-[#f6d6a0] uppercase tracking-wider font-black leading-none">
                      {user?.role}
                    </span>
                    <span className="block font-bold truncate max-w-[100px] leading-tight text-[11px]">
                      {user?.name?.split(" ")[0] || "Admin"}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 bg-white/20 hover:bg-white/30 text-[#304b62] rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white/20 hover:bg-white/30 text-[#304b62] font-extrabold px-3.5 py-2 rounded-xl text-xs lg:text-sm transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setEnrollModalOpen(true)}
                  className="bg-[#304b62] hover:bg-[#253b4e] text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-md text-xs lg:text-sm flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Admission Now
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#304b62] hover:bg-black/10 rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-fadeIn">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            <div className="relative w-80 bg-[#d49539] h-full p-6 shadow-2xl flex flex-col z-10 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-[#304b62]/20">
                <img
                  src={logo}
                  alt="Institute logo"
                  className="h-[44px] object-contain"
                />
                <button onClick={() => setIsOpen(false)} className="p-1 text-[#304b62]">
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Drawer Content */}
              {isAdmin ? (
                /* Admin Mobile Tabs */
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase text-[#304b62] tracking-wider block mb-2">
                    Administration Modules:
                  </span>
                  {adminNavTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = isOnAdminPath && currentAdminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleAdminTabClick(tab.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                          isActive
                            ? "bg-[#304b62] text-white"
                            : "bg-white/20 text-[#304b62] hover:bg-white/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={15} className={isActive ? "text-[#d49539]" : "text-[#304b62]"} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge > 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <div className="pt-3 border-t border-[#304b62]/20 space-y-2">
                    <button
                      onClick={() => {
                        navigate("/courses");
                        setIsOpen(false);
                      }}
                      className="w-full bg-white/20 text-[#304b62] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <Globe size={14} /> View Public Website
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-[#304b62] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <LogOut size={14} /> Sign Out Admin
                    </button>
                  </div>
                </div>
              ) : (
                /* Public Mobile Links */
                <div className="flex flex-col gap-2">
                  {publicNavLinks.map((link) => (
                    <Link
                      to={link.to}
                      key={link.to}
                      onClick={() => setIsOpen(false)}
                      className="font-bold text-base py-2.5 px-3 rounded-lg text-[#304b62] hover:bg-black/10"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-[#304b62]/20 space-y-2">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsOpen(false);
                      }}
                      className="w-full bg-white/20 text-[#304b62] font-bold py-2.5 rounded-xl text-sm"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setEnrollModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full bg-[#304b62] text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Sparkles size={16} /> Admission Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Enrollment Modal */}
      <EnrollmentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        preselectedClass={10}
        preselectedCourse="General Admission Inquiry"
      />
    </>
  );
};

export default Navbar;
