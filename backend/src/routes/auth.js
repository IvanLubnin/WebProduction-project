// backend/src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { query } from "../db/db.js"; 

const router = express.Router();

// helper: find user by email
async function findUserByEmail(email) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

// helper: create user
async function createUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, passwordHash],
  );

  return result.rows[0];
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = await createUser({ username, email, password });
    console.log("New user registered:", newUser);

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Error in /register:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password_hash, ...safeUser } = user;
    return res.json({ message: "Login successful", user: safeUser });
  } catch (err) {
    console.error("Error in /login:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
