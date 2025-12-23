import {
  createReservation,
  listReservations,
  getReservation,
  updateReservationStatus,
  cancelReservation
} from "../services/reservations.service.js";
import { handleError } from "../utils/errors.js";

export async function createReservationHandler(req, res) {
  try {
    const { productId, quantity, pointId, fecha_entrega } = req.body;
    const result = await createReservation(
      { productId, quantity, pointId, fecha_entrega },
      req.user.id
    );
    res.status(201).json(result);
  } catch (err) {
    handleError(err, res);
  }
}

export async function listReservationsHandler(req, res) {
  try {
    const estado = req.query.estado || null;
    const items = await listReservations(req.user, estado);
    res.json(items);
  } catch (err) {
    handleError(err, res);
  }
}

export async function getReservationHandler(req, res) {
  try {
    const reservation = await getReservation(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json(reservation);
  } catch (err) {
    handleError(err, res);
  }
}

export async function updateReservationStatusHandler(req, res) {
  try {
    const { status } = req.body;
    const updated = await updateReservationStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    console.error("updateReservationStatus error", err);
    handleError(err, res);
  }
}

export async function cancelReservationHandler(req, res) {
  try {
    const updated = await cancelReservation(req.params.id, req.user.id);
    res.json(updated);
  } catch (err) {
    console.error("cancelReservation error", err);
    handleError(err, res);
  }
}
