import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { login, me, logout, register } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", authRequired, me);
router.post("/logout", authRequired, logout);

export default router;
