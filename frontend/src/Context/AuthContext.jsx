import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null); // { id, name, email, phone, role }
  const [profile, setProfile] = useState(null); // Role profile (Teacher, Parent, Student, etc.)
  const [token, setToken] = useState(localStorage.getItem("sm_token") || "");
  const [activeChildId, setActiveChildId] = useState(localStorage.getItem("sm_active_child") || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from token on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("sm_token");
      if (storedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.data.success) {
            setIsAuth(true);
            setUser(res.data.data.user);
            setProfile(res.data.data.profile);

            // If Parent, set default active child
            if (res.data.data.user.role === "PARENT" && res.data.data.profile?.student_ids?.length > 0) {
              const currentActive = localStorage.getItem("sm_active_child");
              const validChild = res.data.data.profile.student_ids.find((c) => c._id === currentActive);
              if (validChild) {
                setActiveChildId(validChild._id);
              } else {
                setActiveChildId(res.data.data.profile.student_ids[0]._id);
                localStorage.setItem("sm_active_child", res.data.data.profile.student_ids[0]._id);
              }
            }
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          logoutUser();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = (authData) => {
    const { token, user, profile } = authData;
    localStorage.setItem("sm_token", token);
    setToken(token);
    setUser(user);
    setProfile(profile);
    setIsAuth(true);

    if (user.role === "PARENT" && profile?.student_ids?.length > 0) {
      setActiveChildId(profile.student_ids[0]._id);
      localStorage.setItem("sm_active_child", profile.student_ids[0]._id);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("sm_token");
    localStorage.removeItem("sm_active_child");
    setToken("");
    setUser(null);
    setProfile(null);
    setIsAuth(false);
    setActiveChildId(null);
  };

  const switchActiveChild = (childId) => {
    setActiveChildId(childId);
    localStorage.setItem("sm_active_child", childId);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        user,
        profile,
        token,
        activeChildId,
        loading,
        loginUser,
        logoutUser,
        switchActiveChild,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
