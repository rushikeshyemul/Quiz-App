import jwt from "jsonwebtoken";
import { HttpError } from "./httpError.js";

const PLACEHOLDER_SECRETS = new Set([
  "replace-with-a-long-random-secret",
  "secret",
  "changeme",
  "your_jwt_secret",
]);

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16 || PLACEHOLDER_SECRETS.has(secret)) {
    throw new HttpError(500, "Authentication is not configured");
  }
  return secret;
}

export function signAuthToken(userId) {
  return jwt.sign({ id: String(userId) }, getJwtSecret(), {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

export function verifyAuthToken(token) {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      throw new HttpError(401, "Invalid token");
    }
    return decoded;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "Invalid token");
  }
}
