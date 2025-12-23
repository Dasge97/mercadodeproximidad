import { pool, query } from "../db.js";
import { AppError } from "../utils/errors.js";
import { createNotification } from "./notifications.service.js";

const ALLOWED_STATUSES = ["pendiente", "aceptada", "rechazada", "cancelada", "completada"];

export async function createReservation({ productId, quantity, pointId, fecha_entrega }, buyerId) {
  const cantidad = Number(quantity);
  if (!Number.isFinite(cantidad) || cantidad <= 0) throw new AppError("Cantidad inválida", 400);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [productRows] = await conn.execute(
      "SELECT id, id_vendedor, stock FROM productos WHERE id = ? FOR UPDATE",
      [productId]
    );
    if (!productRows.length) throw new AppError("Producto no encontrado", 404);
    const product = productRows[0];

    const [pointRows] = await conn.execute(
      "SELECT id, id_vendedor FROM puntos_entrega WHERE id = ?",
      [pointId]
    );
    if (!pointRows.length) throw new AppError("Punto de entrega no encontrado", 400);
    if (pointRows[0].id_vendedor !== product.id_vendedor) {
      throw new AppError("El punto de entrega no pertenece al vendedor", 400);
    }

    const stock = Number(product.stock);
    if (!Number.isFinite(stock) || stock < cantidad) {
      throw new AppError("Stock insuficiente", 400);
    }

    await conn.execute("UPDATE productos SET stock = stock - ? WHERE id = ?", [cantidad, productId]);

    const [result] = await conn.execute(
      `INSERT INTO reservas (id_vendedor, id_comprador, id_producto, cantidad, id_punto_entrega, estado, fecha_entrega)
       VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`,
      [product.id_vendedor, buyerId, productId, cantidad, pointId, fecha_entrega || null]
    );

    await conn.commit();

    // Notificación fuera de la transacción para evitar bloqueos
    await createNotification({ userId: product.id_vendedor, reservationId: result.insertId, tipo: "pendiente" });
    return { id: result.insertId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listReservations(user, estado = null) {
  let sql = `
    SELECT r.*, p.nombre AS producto_nombre, pe.descripcion AS punto_descripcion
    FROM reservas r
    JOIN productos p ON r.id_producto = p.id
    LEFT JOIN puntos_entrega pe ON r.id_punto_entrega = pe.id
    WHERE 1=1`;
  const params = {};

  if (user.tipo !== "admin") {
    sql += " AND (r.id_comprador = :uid OR r.id_vendedor = :uid)";
    params.uid = user.id;
  }

  if (estado === "finalizadas") {
    sql += " AND r.estado IN ('completada','rechazada','cancelada')";
  } else if (estado === "encurso") {
    sql += " AND r.estado = 'aceptada'";
  } else if (estado === "pendiente") {
    sql += " AND r.estado = 'pendiente'";
  } else if (estado && ALLOWED_STATUSES.includes(estado)) {
    sql += " AND r.estado = :estado";
    params.estado = estado;
  }

  sql += " ORDER BY r.fecha_creacion DESC";

  return query(sql, params);
}

export async function getReservation(id) {
  const rows = await query(
    `SELECT r.*, p.nombre AS producto_nombre, pe.descripcion AS punto_descripcion
     FROM reservas r
     JOIN productos p ON r.id_producto = p.id
     LEFT JOIN puntos_entrega pe ON r.id_punto_entrega = pe.id
     WHERE r.id = :id`,
    { id }
  );
  return rows[0];
}

async function restoreStock(conn, productId, amount) {
  await conn.execute("UPDATE productos SET stock = stock + ? WHERE id = ?", [amount, productId]);
}

export async function cancelReservation(id, userId) {
  let notify = null;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT id, id_comprador, id_vendedor, id_producto, cantidad, estado FROM reservas WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!rows.length) throw new AppError("Reserva no encontrada", 404);
    const resv = rows[0];
    if (resv.id_comprador !== userId) throw new AppError("No autorizado para cancelar", 403);
    if (["cancelada", "rechazada", "completada"].includes(resv.estado)) {
      throw new AppError("No se puede cancelar en este estado", 400);
    }
    await restoreStock(conn, resv.id_producto, resv.cantidad);
    await conn.execute("UPDATE reservas SET estado = 'cancelada' WHERE id = ?", [id]);
    notify = { userId: resv.id_vendedor, reservationId: id, tipo: "cancelada" };
    await conn.commit();
    if (notify) await createNotification(notify);
    return getReservation(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateReservationStatus(id, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new AppError("Estado inválido", 400);
  }

  let notify = null;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT id, id_comprador, id_vendedor, id_producto, cantidad, estado FROM reservas WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!rows.length) throw new AppError("Reserva no encontrada", 404);
    const resv = rows[0];

    if (resv.estado === status) {
      await conn.commit();
      return getReservation(id);
    }

    const finalStates = ["rechazada", "cancelada", "completada"];
    if (finalStates.includes(resv.estado) && resv.estado !== status) {
      throw new AppError("La reserva ya está cerrada", 400);
    }

    if (status === "aceptada" && resv.estado !== "pendiente") {
      throw new AppError("Solo se puede aceptar una reserva pendiente", 400);
    }
    if (status === "rechazada" && resv.estado !== "pendiente") {
      throw new AppError("Solo se puede rechazar una reserva pendiente", 400);
    }
    if (status === "completada" && resv.estado !== "aceptada") {
      throw new AppError("Solo se puede completar una reserva aceptada", 400);
    }

    if (status === "rechazada" || status === "cancelada") {
      await restoreStock(conn, resv.id_producto, resv.cantidad);
    }

    await conn.execute("UPDATE reservas SET estado = ? WHERE id = ?", [status, id]);

    if (status === "aceptada") {
      notify = { userId: resv.id_comprador, reservationId: id, tipo: "aceptada" };
    } else if (status === "rechazada") {
      notify = { userId: resv.id_comprador, reservationId: id, tipo: "cancelada" };
    } else if (status === "cancelada") {
      notify = { userId: resv.id_vendedor, reservationId: id, tipo: "cancelada" };
    } else if (status === "completada") {
      notify = { userId: resv.id_comprador, reservationId: id, tipo: "recibido" };
    }

    await conn.commit();
    if (notify) await createNotification(notify);
    return getReservation(id);
  } catch (err) {
    console.error("updateReservationStatus failed", err);
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
