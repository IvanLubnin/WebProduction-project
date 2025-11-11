import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { z } from "zod/v4";

import { env } from "../env.js";

const router = express.Router();

const users = new Map();

const registerSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3, "Username must be at least 3 characters long.")
		.max(50, "Username must be 50 characters or fewer."),
	email: z.string().email("Please provide a valid email address."),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long.")
		.max(
			72,
			"Password must be 72 characters or fewer (bcrypt limitation).",
		),
});

const loginSchema = z.object({
	email: z.string().email("Please provide a valid email address."),
	password: z.string().min(1, "Password is required."),
});

function formatIssues(issues) {
	return issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
	}));
}

function toPublicUser(user) {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		createdAt: user.createdAt,
	};
}

router.post("/register", async (req, res, next) => {
	try {
		const { username, email, password } = registerSchema.parse(req.body);
		const normalizedEmail = email.toLowerCase();

		if (users.has(normalizedEmail)) {
			res.status(409).json({
				message: "This email is already registered.",
			});
			return;
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const user = {
			id: randomUUID(),
			username,
			email: normalizedEmail,
			passwordHash,
			createdAt: new Date().toISOString(),
		};

		users.set(normalizedEmail, user);

		res.status(201).json({
			user: toPublicUser(user),
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({
				message: "Validation failed.",
				issues: formatIssues(error.issues),
			});
			return;
		}

		next(error);
	}
});

router.post("/login", async (req, res, next) => {
	try {
		const { email, password } = loginSchema.parse(req.body);
		const normalizedEmail = email.toLowerCase();

		const user = users.get(normalizedEmail);

		if (!user) {
			res.status(401).json({
				message: "Invalid email or password.",
			});
			return;
		}

		const passwordMatches = await bcrypt.compare(password, user.passwordHash);

		if (!passwordMatches) {
			res.status(401).json({
				message: "Invalid email or password.",
			});
			return;
		}

		const token = jwt.sign(
			{
				sub: user.id,
				email: user.email,
			},
			env.JWT_SECRET,
			{
				expiresIn: "1h",
			},
		);

		res.json({
			token,
			user: toPublicUser(user),
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({
				message: "Validation failed.",
				issues: formatIssues(error.issues),
			});
			return;
		}

		next(error);
	}
});

export default router;
