import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { HttpError } from "../lib/httpError.js";
import { toPublicUser } from "../lib/presenters.js";
import { signAuthToken } from "../lib/tokens.js";
import { validateLogin, validateRegistration } from "../lib/validators.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { rateLimit } from "../middleware/rateLimit.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findUserByEmail(email, selectPassword = false) {
  const query = User.findOne({
    email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
  });
  return selectPassword ? query.select("+password") : query;
}

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyFn: (req) => req.ip || "unknown",
});

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = validateRegistration(req.body);
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new HttpError(400, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = signAuthToken(user._id);
    res.status(201).json({ user: toPublicUser(user), token });
  } catch (error) {
    next(error);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = validateLogin(req.body);
    const user = await findUserByEmail(email, true);
    if (!user) {
      throw new HttpError(400, "Invalid credentials");
    }
    if (user.status === "suspended") {
      throw new HttpError(403, "This account is suspended");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpError(400, "Invalid credentials");
    }

    const token = signAuthToken(user._id);
    res.json({ user: toPublicUser(user), token });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

export default router;
