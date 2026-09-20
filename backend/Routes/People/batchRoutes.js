import express from "express";
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../../Controller/People/batchController.js";
import { protect } from "../../Middleware/authMiddleware.js";
import { authorize } from "../../Middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getBatches);
router.get("/:id", protect, getBatchById);
router.post("/", protect, authorize("ADMIN", "SUPER_ADMIN"), createBatch);
router.patch("/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), updateBatch);
router.delete("/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), deleteBatch);

export default router;
