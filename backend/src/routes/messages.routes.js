import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { ensureReservationParticipant } from "../middleware/ownership.js";
import { listMessagesHandler, createMessageHandler } from "../controllers/messages.controller.js";

const router = Router({ mergeParams: true });

router.get("/:id/messages", authRequired, ensureReservationParticipant, listMessagesHandler);
router.post("/:id/messages", authRequired, ensureReservationParticipant, createMessageHandler);

export default router;
