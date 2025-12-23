import { Router } from "express";
import { authRequired, optionalAuth } from "../middleware/auth.js";
import { ensureProductOwner } from "../middleware/ownership.js";
import {
  getProducts,
  getProductById,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler
} from "../controllers/products.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", optionalAuth, getProducts);
router.get("/:id", optionalAuth, getProductById);
router.post(
  "/",
  authRequired,
  validate({
    nombre: { required: true, type: "string" },
    stock: { required: true, type: "number" },
    precio: { required: true, type: "number" }
  }),
  createProductHandler
);
router.put(
  "/:id",
  authRequired,
  ensureProductOwner,
  updateProductHandler
);
router.delete(
  "/:id",
  authRequired,
  ensureProductOwner,
  deleteProductHandler
);

export default router;
