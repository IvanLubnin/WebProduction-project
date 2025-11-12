import express from "express";

const router = express.Router();

// Temporary in-memory user storage
const users = [];

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const newUser = { id: Date.now(), username, email, password };
  users.push(newUser);

  console.log("New user registered:", newUser);
  res.status(201).json({ message: "User registered successfully", user: newUser });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ message: "Login successful", user });
});

export default router;
