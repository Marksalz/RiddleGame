/**
 * @fileoverview Main server entry point for the Riddle Game application.
 * Sets up Express server with middleware, routes, and database connection.
 * @author RiddleGame Team
 * @version 1.0.0
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
 * Logs all incoming requests with timestamp, method, and URL
 */
server.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

server.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "https://riddle-game2001.netlify.app",
    "http://localhost:5173",
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

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware setup
server.use(express.json()); // Parse JSON request bodies
server.use(cookieParser()); // Parse cookies from requests
server.use("/api", router); // Mount API routes

/**
 * Server startup sequence
 * Connects to MongoDB and Supabase, then starts the Express server
 */
try {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  server.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  await connectToMongo();
  await connectToSupabase();
} catch (err) {
  console.error("Failed to connect to databases:", err);
  process.exit(1);
}
