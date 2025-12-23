import { listMessages, createMessage } from "../services/messages.service.js";
import { handleError } from "../utils/errors.js";

export async function listMessagesHandler(req, res) {
  try {
    const messages = await listMessages(req.params.id);
    res.json(messages);
  } catch (err) {
    handleError(err, res);
  }
}

export async function createMessageHandler(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Mensaje requerido" });
    const messages = await createMessage(req.params.id, req.user.id, message);
    res.status(201).json(messages);
  } catch (err) {
    handleError(err, res);
  }
}
