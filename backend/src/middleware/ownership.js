import { query } from "../db.js";

export async function ensureProductOwner(req, res, next) {
  const productId = parseInt(req.params.id || req.params.productId, 10);
  if (!productId) return res.status(400).json({ error: "Producto inválido" });

  const rows = await query(
    "SELECT id_vendedor FROM productos WHERE id = :id",
    { id: productId }
  );
  if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

  const ownerId = rows[0].id_vendedor;
  if (req.user.tipo === "admin" || req.user.id === ownerId) {
    return next();
  }
  return res.status(403).json({ error: "No autorizado para este producto" });
}

export async function ensureReservationParticipant(req, res, next) {
  const reservationId = parseInt(req.params.id || req.params.reservationId, 10);
  if (!reservationId) return res.status(400).json({ error: "Reserva inválida" });

  const rows = await query(
    "SELECT id_comprador, id_vendedor FROM reservas WHERE id = :id",
    { id: reservationId }
  );
  if (rows.length === 0) return res.status(404).json({ error: "Reserva no encontrada" });

  const { id_comprador, id_vendedor } = rows[0];
  if (req.user.tipo === "admin" || req.user.id === id_comprador || req.user.id === id_vendedor) {
    req.reservationParticipants = { id_comprador, id_vendedor };
    return next();
  }
  return res.status(403).json({ error: "No autorizado para esta reserva" });
}

export async function ensureReservationSeller(req, res, next) {
  const reservationId = parseInt(req.params.id || req.params.reservationId, 10);
  if (!reservationId) return res.status(400).json({ error: "Reserva inválida" });

  const rows = await query(
    "SELECT id_vendedor FROM reservas WHERE id = :id",
    { id: reservationId }
  );
  if (rows.length === 0) return res.status(404).json({ error: "Reserva no encontrada" });

  const ownerId = rows[0].id_vendedor;
  if (req.user.tipo === "admin" || req.user.id === ownerId) {
    return next();
  }
  return res.status(403).json({ error: "Solo el vendedor puede modificar esta reserva" });
}
