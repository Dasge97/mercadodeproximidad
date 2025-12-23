import jwt from "jsonwebtoken";
import { authenticateUser, getUserById, createUser } from "../services/auth.service.js";
import { handleError } from "../utils/errors.js";

export async function login(req, res) {
  const { email, username, password } = req.body;
  const identifier = email || username;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Email/usuario y contraseña requeridos" });
  }

  try {
    const user = await authenticateUser(identifier, password);
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo, nombre: user.nombre },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "12h" }
    );
    res.json({ token, user });
  } catch (err) {
    handleError(err, res);
  }
}

export async function register(req, res) {
  try {
    const { nombre, nickname, email, password, tipo } = req.body;
    const user = await createUser({ nombre, nickname, email, password, tipo });
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo, nombre: user.nombre },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "12h" }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    handleError(err, res);
  }
}

export async function me(req, res) {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    handleError(err, res);
  }
}

export function logout(_req, res) {
  res.json({ ok: true });
}
