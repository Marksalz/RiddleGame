/**
 * @fileoverview Main server entry point for the Riddle Game application.
 * Sets up Express server with middleware, routes, and database connection.
 * @author RiddleGame Team
 * @version 1.0.0
 */

import express from "express";
import router from "./router.js";
import cookieParser from 'cookie-parser';
import "dotenv/config";
import { connectToMongo } from "./lib/riddles/riddleDb.js";

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

// Middleware setup
server.use(express.json()); // Parse JSON request bodies
server.use(cookieParser()); // Parse cookies from requests
server.use("/api", router); // Mount API routes

/**
 * Server startup sequence
 * Connects to MongoDB and starts the Express server
 */
try {
  await connectToMongo();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error("Failed to connect to DB:", err);
  process.exit(1);
}