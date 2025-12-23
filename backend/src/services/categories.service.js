import { query } from "../db.js";

export async function listCategories() {
  return query("SELECT id, nombre, descripcion FROM categorias ORDER BY nombre ASC");
}
