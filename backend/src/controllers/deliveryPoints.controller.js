import { listPointsBySeller, replacePoints } from "../services/deliveryPoints.service.js";
import { handleError } from "../utils/errors.js";

export async function listDeliveryPoints(req, res) {
  try {
    const points = await listPointsBySeller(req.user.id);
    res.json(points);
  } catch (err) {
    handleError(err, res);
  }
}

export async function saveDeliveryPoints(req, res) {
  try {
    const points = Array.isArray(req.body?.points) ? req.body.points : [];
    const saved = await replacePoints(req.user.id, points);
    res.json(saved);
  } catch (err) {
    handleError(err, res);
  }
}
