// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db.js";          // <- just import to init DB connection
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());           // later you can restrict origin
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // full paths: /api/auth/register, /api/auth/login

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
