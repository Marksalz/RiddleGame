/**
 * Main router module for the Riddle Game API
 * Combines and configures all sub-routers for different API endpoints
 */

import express from "express";
import riddleRouter from "./routers/riddleRouter.js";
import playerRouter from "./routers/playerRouter.js";

/**
 * Express router instance that combines all API routes
 * @type {express.Router}
 */
const router = express.Router();


router.use("/riddles", riddleRouter);
router.use("/players", playerRouter);

export default router;