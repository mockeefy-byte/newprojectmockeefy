import express from "express";
import { authenticateToken } from "../controllers/authController.js";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.use(authenticateToken); // Protect all routes

router.get('/', getNotifications);
router.put('/read', markAsRead);

export default router;
