import { query } from "../db.js";

export async function createNotification({ userId, reservationId, tipo }) {
  if (!userId || !reservationId || !tipo) return;
  await query(
    `INSERT INTO notificaciones (id_reserva, id_usuario, tipo, leida)
     VALUES (:id_reserva, :id_usuario, :tipo, FALSE)`,
    { id_reserva: reservationId, id_usuario: userId, tipo }
  );
}

export async function listNotifications(userId) {
  return query(
    `SELECT * FROM notificaciones
     WHERE id_usuario = :userId
     ORDER BY fecha_creacion DESC`,
    { userId }
  );
}

export async function markNotificationRead(id, userId) {
  await query(
    `UPDATE notificaciones SET leida = TRUE
     WHERE id = :id AND id_usuario = :userId`,
    { id, userId }
  );
}
