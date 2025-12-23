import { createRating, listRatingsForUser, listRatingsByAuthor } from "../services/ratings.service.js";
import { handleError } from "../utils/errors.js";

export async function createRatingHandler(req, res) {
  try {
    await createRating(req.params.id, req.user.id, req.body);
    res.status(201).json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
}

export async function listRatingsHandler(req, res) {
  try {
    const ratings = await listRatingsForUser(req.params.id);
    res.json(ratings);
  } catch (err) {
    handleError(err, res);
  }
}

export async function listRatingsSentHandler(req, res) {
  try {
    const ratings = await listRatingsByAuthor(req.params.id);
    res.json(ratings);
  } catch (err) {
    handleError(err, res);
  }
}
