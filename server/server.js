/**
 * @fileoverview Main server entry point for the Riddle Game application.
 * Sets up Express server with middleware, routes, and database connection.
 * @author RiddleGame Team
 * @version 1.1.0
 */

import express from "express";
import router from "./router.js";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectToMongo } from "./lib/riddles/riddleDb.js";
import { connectToSupabase } from "./lib/players/playerDb.js";

const PORT = process.env.PORT || 3000;
const server = express();

/**
 * Request logging middleware
 */
server.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * CORS middleware
 */
server.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://riddle-game2001.netlify.app",
    "https://riddlegame-7cyj.onrender.com",
  ];
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware setup
server.use(express.json());
server.use(cookieParser());
server.use("/api", router);

//Health check (Render will use this)
server.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/**
 * Start server first, then connect to databases
 * Prevents Render from hanging on deployment
 */
server.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await connectToMongo();
    console.log("MongoDB connected");
    await connectToSupabase();
    console.log("Supabase connected");
  } catch (err) {
    console.error("Failed to connect to databases:", err.message);
  }
});
