import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { listNotificationsHandler, markNotificationHandler } from "../controllers/notifications.controller.js";

const router = Router();

router.get("/", authRequired, listNotificationsHandler);
router.patch("/:id/read", authRequired, markNotificationHandler);

export default router;
