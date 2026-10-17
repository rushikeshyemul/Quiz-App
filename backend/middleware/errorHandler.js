import { HttpError } from "../lib/httpError.js";

export function notFound(req, res) {
  res.status(404).json({ message: "Not found" });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err?.name === "CastError") {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  if (err?.code === 11000 && err?.keyPattern?.email) {
    res.status(400).json({ message: "Email already registered" });
    return;
  }

  const status = err instanceof HttpError ? err.status : err.status || 500;
  if (status >= 500) {
    console.error(err);
  }

  const message = status >= 500 ? "Something went wrong" : err.message || "Request failed";
  const body = { message };
  if (err instanceof HttpError && err.code) {
    body.code = err.code;
  }
  res.status(status).json(body);
}
