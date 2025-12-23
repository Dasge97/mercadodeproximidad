import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { ensureReservationParticipant, ensureReservationSeller } from "../middleware/ownership.js";
import {
  createReservationHandler,
  listReservationsHandler,
  getReservationHandler,
  updateReservationStatusHandler,
  cancelReservationHandler
} from "../controllers/reservations.controller.js";

const router = Router();

router.post("/", authRequired, createReservationHandler);
router.get("/", authRequired, listReservationsHandler);
router.get("/:id", authRequired, ensureReservationParticipant, getReservationHandler);
router.put("/:id/cancel", authRequired, ensureReservationParticipant, cancelReservationHandler);
router.put(
  "/:id/status",
  authRequired,
  ensureReservationSeller,
  updateReservationStatusHandler
);

export default router;
