import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import reservationsRoutes from "./routes/reservations.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import ratingsRoutes from "./routes/ratings.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import deliveryPointsRoutes from "./routes/deliveryPoints.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:8080"
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "mercado-backend" });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/reservations", messagesRoutes);
app.use("/api", ratingsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/delivery-points", deliveryPointsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "No encontrado" });
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
