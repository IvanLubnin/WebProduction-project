import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

function uniqueEmail() {
	return `${randomUUID()}@example.com`;
}

function validPassword() {
	return "Password123!";
}

describe("POST /api/v1/auth/register", () => {
	it("registers a new user and hides the password hash", async () => {
		const email = uniqueEmail();
		const response = await request(app)
			.post("/api/v1/auth/register")
			.send({
				username: "Test User",
				email,
				password: validPassword(),
			})
			.expect("Content-Type", /json/)
			.expect(201);

		expect(response.body).toHaveProperty("user");
		expect(response.body.user).toMatchObject({
			username: "Test User",
			email,
		});
		expect(response.body.user).toHaveProperty("id");
		expect(response.body.user).not.toHaveProperty("passwordHash");
	});

	it("rejects duplicate email registrations", async () => {
		const email = uniqueEmail();

		await request(app)
			.post("/api/v1/auth/register")
			.send({
				username: "Original User",
				email,
				password: validPassword(),
			})
			.expect(201);

		const response = await request(app)
			.post("/api/v1/auth/register")
			.send({
				username: "Duplicate User",
				email,
				password: validPassword(),
			})
			.expect("Content-Type", /json/)
			.expect(409);

		expect(response.body).toHaveProperty("message", "This email is already registered.");
	});
});

describe("POST /api/v1/auth/login", () => {
	it("returns a token for a valid user", async () => {
		const email = uniqueEmail();
		const password = validPassword();

		await request(app).post("/api/v1/auth/register").send({
			username: "Login User",
			email,
			password,
		});

		const response = await request(app)
			.post("/api/v1/auth/login")
			.send({
				email,
				password,
			})
			.expect("Content-Type", /json/)
			.expect(200);

		expect(response.body).toHaveProperty("token");
		expect(response.body).toHaveProperty("user");
		expect(response.body.user).toMatchObject({
			username: "Login User",
			email,
		});
	});

	it("rejects invalid credentials", async () => {
		const response = await request(app)
			.post("/api/v1/auth/login")
			.send({
				email: uniqueEmail(),
				password: validPassword(),
			})
			.expect("Content-Type", /json/)
			.expect(401);

		expect(response.body).toHaveProperty("message", "Invalid email or password.");
	});
});
