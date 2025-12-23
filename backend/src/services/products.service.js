import { query } from "../db.js";
import { AppError } from "../utils/errors.js";

function toNumberOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function listProducts(filters = {}) {
  const { sellerId, categoryId, q, lat, lng, radiusKm = 10 } = filters;

  let sql = `
    SELECT p.*, u.nombre AS vendedor_nombre, u.lat AS vendedor_lat, u.lng AS vendedor_lng,
           c.nombre AS categoria_nombre
    FROM productos p
    JOIN usuarios u ON p.id_vendedor = u.id
    LEFT JOIN categorias c ON p.id_categoria = c.id
    WHERE 1=1`;
  const params = {};

  if (!sellerId) {
    sql += " AND p.stock > 0";
  }
  if (sellerId) {
    sql += " AND p.id_vendedor = :sellerId";
    params.sellerId = sellerId;
  }
  if (categoryId) {
    sql += " AND p.id_categoria = :categoryId";
    params.categoryId = categoryId;
  }
  if (q) {
    sql += " AND (p.nombre LIKE :q OR p.descripcion LIKE :q)";
    params.q = `%${q}%`;
  }

  const products = await query(sql, params);
  const points = await query("SELECT id, id_vendedor, lat, lng, descripcion FROM puntos_entrega", {});

  if (!lat || !lng) {
    return products.map((p) => ({
      ...p,
      distanceKm: null,
      puntos_entrega: points.filter((pt) => pt.id_vendedor === p.id_vendedor)
    }));
  }

  const zoneLat = Number(lat);
  const zoneLng = Number(lng);
  if (!Number.isFinite(zoneLat) || !Number.isFinite(zoneLng)) {
    return products.map((p) => ({
      ...p,
      distanceKm: null,
      puntos_entrega: points.filter((pt) => pt.id_vendedor === p.id_vendedor)
    }));
  }

  return products
    .map((p) => {
      const vendorPointDistance =
        p.vendedor_lat !== null && p.vendedor_lng !== null
          ? haversineKm(zoneLat, zoneLng, Number(p.vendedor_lat), Number(p.vendedor_lng))
          : null;

      const vendorPoints = points.filter((pt) => pt.id_vendedor === p.id_vendedor);
      const pointDistances = vendorPoints
        .map((pt) => haversineKm(zoneLat, zoneLng, Number(pt.lat), Number(pt.lng)))
        .filter((d) => Number.isFinite(d));

      const minPointDistance = pointDistances.length ? Math.min(...pointDistances) : null;
      const minDistance =
        vendorPointDistance !== null && minPointDistance !== null
          ? Math.min(vendorPointDistance, minPointDistance)
          : vendorPointDistance !== null
          ? vendorPointDistance
          : minPointDistance;

      return { ...p, distanceKm: minDistance, puntos_entrega: vendorPoints };
    })
    .filter((p) => p.distanceKm === null || p.distanceKm <= radiusKm);
}

export async function getProduct(id) {
  const rows = await query(
    `SELECT p.*, u.nombre AS vendedor_nombre, u.lat AS vendedor_lat, u.lng AS vendedor_lng,
            c.nombre AS categoria_nombre
     FROM productos p
     JOIN usuarios u ON p.id_vendedor = u.id
     LEFT JOIN categorias c ON p.id_categoria = c.id
     WHERE p.id = :id`,
    { id }
  );
  return rows[0];
}

export async function createProduct(data, sellerId) {
  const {
    nombre,
    id_categoria = null,
    tipo = null,
    stock,
    precio,
    descripcion = null,
    imagen = null,
    duracion_producto = null
  } = data;

  const result = await query(
    `INSERT INTO productos
    (nombre, id_categoria, tipo, stock, precio, descripcion, imagen, id_vendedor, duracion_producto)
    VALUES (:nombre, :id_categoria, :tipo, :stock, :precio, :descripcion, :imagen, :id_vendedor, :duracion_producto)`,
    {
      nombre,
      id_categoria,
      tipo,
      stock: toNumberOrNull(stock),
      precio: toNumberOrNull(precio),
      descripcion,
      imagen,
      id_vendedor: sellerId,
      duracion_producto: duracion_producto !== undefined ? toNumberOrNull(duracion_producto) : null
    }
  );
  return { id: result.insertId, ...data, id_vendedor: sellerId };
}

export async function updateProduct(id, data) {
  const fields = [];
  const params = { id };
  const allowed = ["nombre", "id_categoria", "tipo", "stock", "precio", "descripcion", "imagen", "duracion_producto"];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = :${key}`);
      params[key] = ["stock", "precio", "duracion_producto"].includes(key)
        ? toNumberOrNull(data[key])
        : data[key];
    }
  }
  if (!fields.length) throw new AppError("Nada que actualizar", 400);
  await query(`UPDATE productos SET ${fields.join(", ")} WHERE id = :id`, params);
  return getProduct(id);
}

export async function deleteProduct(id) {
  await query("DELETE FROM productos WHERE id = :id", { id });
}
