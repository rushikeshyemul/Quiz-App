import User from "../models/User.js";
import { HttpError } from "../lib/httpError.js";
import { verifyAuthToken } from "../lib/tokens.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
      throw new HttpError(401, "Authentication required");
    }

    const decoded = verifyAuthToken(token);
    const user = await User.findById(decoded.id).select("name email role status createdAt");
    if (!user) {
      throw new HttpError(401, "Invalid token");
    }
    if (user.status === "suspended") {
      throw new HttpError(403, "This account is suspended");
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    next(new HttpError(401, "Invalid token"));
  }
}
