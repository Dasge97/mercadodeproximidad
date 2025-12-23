import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { AppError } from "../utils/errors.js";

export async function findUserByCredential(identifier) {
  const rows = await query(
    "SELECT id, nombre, nickname, email, contrasena, tipo, lat, lng FROM usuarios WHERE email = :id OR nickname = :id",
    { id: identifier }
  );
  return rows[0];
}

export async function getUserById(id) {
  const rows = await query(
    "SELECT id, nombre, nickname, email, tipo, lat, lng, fecha_creacion FROM usuarios WHERE id = :id",
    { id }
  );
  return rows[0];
}

export async function authenticateUser(identifier, password) {
  const user = await findUserByCredential(identifier);
  if (!user) throw new AppError("Usuario o contraseña incorrectos", 401);

  const stored = user.contrasena;
  let valid = false;
  if (stored && stored.startsWith("$2")) {
    valid = await bcrypt.compare(password, stored);
  } else {
    valid = password === stored;
  }

  if (!valid) throw new AppError("Usuario o contraseña incorrectos", 401);

  delete user.contrasena;
  return user;
}

export async function createUser({ nombre, nickname, email, password, tipo = "comprador" }) {
  if (!nombre || !nickname || !email || !password) {
    throw new AppError("Faltan campos requeridos", 400);
  }
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await query(
      `INSERT INTO usuarios (nombre, nickname, email, contrasena, tipo)
       VALUES (:nombre, :nickname, :email, :contrasena, :tipo)`,
      { nombre, nickname, email, contrasena: hashed, tipo }
    );
    return getUserById(result.insertId);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      throw new AppError("Email o nickname ya existe", 400);
    }
    throw err;
  }
}
