import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "../services/products.service.js";
import { handleError } from "../utils/errors.js";

export async function getProducts(req, res) {
  try {
    const products = await listProducts({
      sellerId: req.query.sellerId ? Number(req.query.sellerId) : undefined,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      q: req.query.q,
      lat: req.query.lat,
      lng: req.query.lng,
      radiusKm: req.query.radiusKm ? Number(req.query.radiusKm) : undefined
    });
    res.json(products);
  } catch (err) {
    handleError(err, res);
  }
}

export async function getProductById(req, res) {
  try {
    const product = await getProduct(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    handleError(err, res);
  }
}

export async function createProductHandler(req, res) {
  try {
    const product = await createProduct(req.body, req.user.id);
    res.status(201).json(product);
  } catch (err) {
    handleError(err, res);
  }
}

export async function updateProductHandler(req, res) {
  try {
    const product = await updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    handleError(err, res);
  }
}

export async function deleteProductHandler(req, res) {
  try {
    await deleteProduct(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
}
