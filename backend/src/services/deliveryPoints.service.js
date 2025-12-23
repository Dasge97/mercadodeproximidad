import { query } from "../db.js";
import { AppError } from "../utils/errors.js";

export async function listPointsBySeller(sellerId) {
  return query(
    "SELECT id, lat, lng, descripcion FROM puntos_entrega WHERE id_vendedor = :id_vendedor",
    { id_vendedor: sellerId }
  );
}

export async function replacePoints(sellerId, points = []) {
  if (!Array.isArray(points) || points.length === 0) {
    await query("DELETE FROM puntos_entrega WHERE id_vendedor = :id_vendedor", { id_vendedor: sellerId });
    return [];
  }
  if (points.length > 5) throw new AppError("Máximo 5 puntos de entrega", 400);
  await query("DELETE FROM puntos_entrega WHERE id_vendedor = :id_vendedor", { id_vendedor: sellerId });
  for (const pt of points) {
    if (pt.lat === undefined || pt.lng === undefined) continue;
    await query(
      `INSERT INTO puntos_entrega (id_vendedor, lat, lng, descripcion)
       VALUES (:id_vendedor, :lat, :lng, :descripcion)`,
      {
        id_vendedor: sellerId,
        lat: pt.lat,
        lng: pt.lng,
        descripcion: pt.descripcion || null
      }
    );
  }
  return listPointsBySeller(sellerId);
}
