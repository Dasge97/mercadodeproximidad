import { listNotifications, markNotificationRead } from "../services/notifications.service.js";
import { handleError } from "../utils/errors.js";

export async function listNotificationsHandler(req, res) {
  try {
    const items = await listNotifications(req.user.id);
    res.json(items);
  } catch (err) {
    handleError(err, res);
  }
}

export async function markNotificationHandler(req, res) {
  try {
    await markNotificationRead(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
}
