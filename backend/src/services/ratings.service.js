import { query } from "../db.js";
import { AppError } from "../utils/errors.js";

function ensureScore(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    throw new AppError(`Campo ${field} debe estar entre 1 y 5`, 400);
  }
  return num;
}

export async function createRating(reservationId, authorId, data) {
  const reservationRows = await query(
    "SELECT id_comprador, id_vendedor, estado FROM reservas WHERE id = :id",
    { id: reservationId }
  );
  if (!reservationRows.length) throw new AppError("Reserva no encontrada", 404);
  const reservation = reservationRows[0];

  if (reservation.estado !== "completada") {
    throw new AppError("Solo se puede valorar reservas completadas", 400);
  }
  if (authorId !== reservation.id_comprador && authorId !== reservation.id_vendedor) {
    throw new AppError("No autorizado para valorar esta reserva", 403);
  }

  const existing = await query(
    "SELECT id FROM valoraciones WHERE id_reserva = :id_reserva AND id_autor = :id_autor",
    { id_reserva: reservationId, id_autor: authorId }
  );
  if (existing.length) throw new AppError("Ya has valorado esta reserva", 400);

  const nota_producto = ensureScore(data.nota_producto, "nota_producto");
  const nota_entrega = ensureScore(data.nota_entrega, "nota_entrega");
  const nota_negociacion = ensureScore(data.nota_negociacion, "nota_negociacion");

  const destinatario = authorId === reservation.id_comprador ? reservation.id_vendedor : reservation.id_comprador;

  await query(
    `INSERT INTO valoraciones
    (id_reserva, id_autor, id_destinatario, nota_producto, nota_entrega, nota_negociacion, comentario)
    VALUES (:id_reserva, :id_autor, :id_destinatario, :nota_producto, :nota_entrega, :nota_negociacion, :comentario)`,
    {
      id_reserva: reservationId,
      id_autor: authorId,
      id_destinatario: destinatario,
      nota_producto,
      nota_entrega,
      nota_negociacion,
      comentario: data.comentario || null
    }
  );

  return { ok: true };
}

export async function listRatingsForUser(userId) {
  return query(
    `SELECT v.*, u.nombre AS autor_nombre
     FROM valoraciones v
     JOIN usuarios u ON v.id_autor = u.id
     WHERE v.id_destinatario = :id_destinatario
     ORDER BY v.fecha_creacion DESC`,
    { id_destinatario: userId }
  );
}

export async function listRatingsByAuthor(userId) {
  return query(
    `SELECT v.*, u.nombre AS destinatario_nombre
     FROM valoraciones v
     JOIN usuarios u ON v.id_destinatario = u.id
     WHERE v.id_autor = :id_autor
     ORDER BY v.fecha_creacion DESC`,
    { id_autor: userId }
  );
}
