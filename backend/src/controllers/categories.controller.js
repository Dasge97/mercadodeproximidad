import { listCategories } from "../services/categories.service.js";
import { handleError } from "../utils/errors.js";

export async function getCategories(_req, res) {
  try {
    const categories = await listCategories();
    res.json(categories);
  } catch (err) {
    handleError(err, res);
  }
}
