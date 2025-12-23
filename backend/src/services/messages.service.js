import { query } from "../db.js";
import { AppError } from "../utils/errors.js";

export async function getReservationParticipants(reservationId) {
  const rows = await query(
    "SELECT id_comprador, id_vendedor FROM reservas WHERE id = :id",
    { id: reservationId }
  );
  return rows[0];
}

export async function listMessages(reservationId) {
  const rows = await query(
    "SELECT * FROM mensajes WHERE id_reserva = :id ORDER BY fecha_creacion ASC",
    { id: reservationId }
  );

  return rows.map((row) => {
    let author_id = row.id_comprador;
    let text = row.mensaje;
    try {
      const parsed = JSON.parse(row.mensaje);
      if (parsed && parsed.text) {
        text = parsed.text;
        author_id = parsed.author || author_id;
      }
    } catch (_err) {
      // mensaje en texto plano: asumimos autor comprador (seed)
    }
    return { ...row, mensaje: text, author_id };
  });
}

export async function createMessage(reservationId, senderId, message) {
  const participants = await getReservationParticipants(reservationId);
  if (!participants) throw new AppError("Reserva no encontrada", 404);

  if (senderId !== participants.id_comprador && senderId !== participants.id_vendedor) {
    throw new AppError("No autorizado para esta reserva", 403);
  }

  await query(
    `INSERT INTO mensajes (id_reserva, id_comprador, id_vendedor, mensaje)
     VALUES (:id_reserva, :id_comprador, :id_vendedor, :mensaje)`,
    {
      id_reserva: reservationId,
      id_comprador: participants.id_comprador,
      id_vendedor: participants.id_vendedor,
      mensaje: JSON.stringify({ author: senderId, text: message })
    }
  );

  return listMessages(reservationId);
}
