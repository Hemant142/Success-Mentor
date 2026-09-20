import jwt from "jsonwebtoken";
import User from "../../Model/People/User.js";
import Institute from "../../Model/People/Institute.js";
import Teacher from "../../Model/People/Teacher.js";
import Parent from "../../Model/People/Parent.js";
import Student from "../../Model/People/Student.js";
import { successResponse, errorResponse } from "../../Utils/responseHandler.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, institute_id: user.institute_id },
    process.env.JWTSECRET || "success-mentor-Mk",
    { expiresIn: "7d" }
  );
};

// 1. User Login (Multi-Role)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Please provide email/phone and password", 400);
    }

    // Find by email or phone
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { phone: email.trim() }],
    });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    if (user.status !== "ACTIVE") {
      return errorResponse(res, "Account is inactive or pending approval", 403);
    }

    const token = generateToken(user);

    // Fetch Role-Specific Profile Details
    let profileData = null;
    if (user.role === "TEACHER") {
      profileData = await Teacher.findOne({ user_id: user._id }).populate("assigned_batches");
    } else if (user.role === "PARENT") {
      profileData = await Parent.findOne({ user_id: user._id }).populate({
        path: "student_ids",
        populate: { path: "enrolled_batches" },
      });
    } else if (user.role === "STUDENT") {
      profileData = await Student.findOne({ user_id: user._id })
        .populate("enrolled_batches")
        .populate("parent_id");
    } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      profileData = await Institute.findById(user.institute_id);
    }

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url,
          institute_id: user.institute_id,
        },
        profile: profileData,
      },
      `Welcome back, ${user.name}!`
    );
  } catch (err) {
    return errorResponse(res, "Login failed", 500, err);
  }
};

// 2. Register Institute + Admin
export const registerInstitute = async (req, res) => {
  try {
    const { institute_name, admin_name, email, phone, password, city } = req.body;

    if (!institute_name || !admin_name || !email || !phone || !password) {
      return errorResponse(res, "All fields are required", 400);
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });
    if (existingUser) {
      return errorResponse(res, "User with this email or phone already exists", 400);
    }

    const slug = institute_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Create Institute
    const institute = await Institute.create({
      name: institute_name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      address: { city: city || "Delhi NCR" },
      contact_email: email,
      contact_phone: phone,
      classes_offered: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });

    // Create Admin User
    const adminUser = await User.create({
      name: admin_name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: "ADMIN",
      institute_id: institute._id,
    });

    institute.admin_user_id = adminUser._id;
    await institute.save();

    const token = generateToken(adminUser);

    return successResponse(
      res,
      {
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          institute_id: institute._id,
        },
        institute,
      },
      "Institute and Admin registered successfully!",
      201
    );
  } catch (err) {
    return errorResponse(res, "Failed to register institute", 500, err);
  }
};

// 3. Get Authenticated User Profile (`/api/auth/me`)
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profileData = null;

    if (user.role === "TEACHER") {
      profileData = await Teacher.findOne({ user_id: user._id }).populate("assigned_batches");
    } else if (user.role === "PARENT") {
      profileData = await Parent.findOne({ user_id: user._id }).populate({
        path: "student_ids",
        populate: { path: "enrolled_batches" },
      });
    } else if (user.role === "STUDENT") {
      profileData = await Student.findOne({ user_id: user._id })
        .populate("enrolled_batches")
        .populate("parent_id");
    } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      profileData = await Institute.findById(user.institute_id);
    }

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url,
          institute_id: user.institute_id,
        },
        profile: profileData,
      },
      "User profile retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to fetch profile", 500, err);
  }
};
