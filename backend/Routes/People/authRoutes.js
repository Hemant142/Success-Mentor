import express from "express";
import { login, registerInstitute, getMe } from "../../Controller/People/authController.js";
import { protect } from "../../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register-institute", registerInstitute);
router.get("/me", protect, getMe);

export default router;
