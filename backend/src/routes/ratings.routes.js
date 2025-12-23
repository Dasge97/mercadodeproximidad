import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { ensureReservationParticipant } from "../middleware/ownership.js";
import {
  createRatingHandler,
  listRatingsHandler,
  listRatingsSentHandler
} from "../controllers/ratings.controller.js";

const router = Router();

router.post(
  "/reservations/:id/ratings",
  authRequired,
  ensureReservationParticipant,
  createRatingHandler
);

router.get("/users/:id/ratings", listRatingsHandler);
router.get("/users/:id/ratings/sent", listRatingsSentHandler);

export default router;
