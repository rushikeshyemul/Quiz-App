import { HttpError } from "../lib/httpError.js";

export function rateLimit({ windowMs, max, keyFn }) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = keyFn ? keyFn(req) : req.ip || "unknown";
    const recent = (buckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);

    if (recent.length >= max) {
      next(new HttpError(429, "Too many requests. Try again later.", "RATE_LIMITED"));
      return;
    }

    recent.push(now);
    buckets.set(key, recent);
    next();
  };
}
