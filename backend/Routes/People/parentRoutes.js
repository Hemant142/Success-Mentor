import express from "express";
import { getMyChildren, getChildOverview } from "../../Controller/People/parentController.js";
import { protect } from "../../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/children", protect, getMyChildren);
router.get("/child/:studentId/overview", protect, getChildOverview);

export default router;
