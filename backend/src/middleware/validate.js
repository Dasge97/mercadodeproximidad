export function validate(schema = {}) {
  return (req, res, next) => {
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      if (rules.required && (value === undefined || value === null || value === "")) {
        return res.status(400).json({ error: `Campo ${field} requerido` });
      }
      if (value !== undefined && rules.type) {
        if (rules.type === "number" && typeof value !== "number") {
          return res.status(400).json({ error: `Campo ${field} debe ser numérico` });
        }
        if (rules.type === "string" && typeof value !== "string") {
          return res.status(400).json({ error: `Campo ${field} debe ser texto` });
        }
      }
    }
    next();
  };
}
