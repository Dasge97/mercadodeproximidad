import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { listDeliveryPoints, saveDeliveryPoints } from "../controllers/deliveryPoints.controller.js";

const router = Router();

router.get("/", authRequired, listDeliveryPoints);
router.post("/", authRequired, saveDeliveryPoints);

export default router;
