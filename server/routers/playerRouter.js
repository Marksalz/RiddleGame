/**
 * @fileoverview Router handling all player-related API endpoints.
 * Includes authentication, player management, scores, and leaderboard functionality.
 * @author RiddleGame Team
 */
// @ts-nocheck
import express from "express";
import { playerCtrl } from "../controllers/playerController.js";
import { verifyToken, checkUserExists } from "../middleware/auth.js";
const playerRouter = express.Router();

/**
 * POST /api/players/create_player
 * Creates or retrieves an existing player (legacy endpoint)
 * @route POST /api/players/create_player
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Player username
 * @returns {Object} Player object
 */
playerRouter.post("/create_player", async (req, res) => {
  try {
    const { name, role } = req.body;
    const player = await playerCtrl.getOrCreatePlayerGuest(name, role);
    console.log("Player created or fetched:", player);
    res.json(player);
  } catch (err) {
    console.error("Failed to create or get player:", err);
    res
      .status(400)
      .json({ error: "Failed to create or get player.", details: err.message });
  }
});

/**
 * POST /api/players/signup
 * Creates a new player account with password authentication
 * @route POST /api/players/signup
 * @param {Object} req.body - Registration data
 * @param {string} req.body.username - Desired username
 * @param {string} req.body.password - Password for the account
 * @param {string} [req.body.role='user'] - User role (guest, user, admin)
 * @returns {Object} Player data with authentication token
 */
playerRouter.post("/signup", async (req, res) => {
  try {
    const { username, password, role = "user" } = req.body;

    const result = await playerCtrl.signupPlayer(username, password, role);

    // Set HTTP-only cookie with JWT token (7-day expiration)
    res.cookie("token", result.token, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      ...result.player,
      token: result.token,
      expiresIn: result.expiresIn,
    });
  } catch (err) {
    console.error("Failed to create player:", err);
    res.status(500).json({ error: err.message || "Server internal error" });
  }
});

/**
 * POST /api/players/check-user
 * Checks if a user exists and validates their authentication token
 * @route POST /api/players/check-user
 * @middleware checkUserExists - Checks if username exists in database
 * @middleware verifyToken - Validates JWT token from cookies
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username to check
 * @returns {Object} Authentication status and user information
 */
playerRouter.post(
  "/check-user",
  checkUserExists,
  verifyToken,
  async (req, res) => {
    try {
      const { username } = req.body;

      const result = await playerCtrl.checkUserAuthentication(username, req);

      // Handle token expiration specifically
      if (req.tokenExpired) {
        return res.status(401).json({
          ...result,
          tokenExpired: true,
          tokenError: req.tokenError,
        });
      }

      // Handle other token errors
      if (req.tokenError && !req.authenticated) {
        return res.status(401).json({
          ...result,
          tokenError: req.tokenError,
        });
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

/**
 * POST /api/players/login-with-name
 * Authenticates a player with username and password
 * @route POST /api/players/login-with-name
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.username - Player username
 * @param {string} req.body.password - Player password
 * @returns {Object} Authentication result with token and user data
 */
playerRouter.post("/login-with-name", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await playerCtrl.loginPlayer(username, password);

    res.cookie("token", result.token, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
      path: "/",
    });

    res.json(result);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
});

/**
 * GET /api/players/leaderboard
 * Retrieves the player leaderboard sorted by lowest completion time
 * @route GET /api/players/leaderboard
 * @returns {Array} Array of players ordered by performance
 */
playerRouter.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await playerCtrl.getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch leaderboard.", details: err.message });
  }
});

/**
 * PUT /api/players/update_time/:id
 * Updates a player's best completion time
 * @route PUT /api/players/update_time/:id
 * @param {string} req.params.id - Player ID
 * @param {Object} req.body - Update data
 * @param {number} req.body.time - New completion time
 * @returns {Object} Success message or error details
 */
playerRouter.put("/update_time/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { time } = req.body;

    await playerCtrl.updatePlayerTime(id, time);
    res.json({ message: "Player time updated successfully" });
  } catch (err) {
    console.error("Failed to update player time:", err);
    res
      .status(400)
      .json({ error: "Failed to update player time.", details: err.message });
  }
});

/**
 * POST /api/players/record_solved_riddle
 * Records when a player solves a riddle with their completion time
 * @route POST /api/players/record_solved_riddle
 * @param {Object} req.body - Solve record data
 * @param {number} req.body.player_id - ID of the player
 * @param {string} req.body.riddle_id - ID of the solved riddle
 * @param {number} req.body.time_to_solve - Time taken to solve in seconds
 * @returns {Object} Created score record
 */
playerRouter.post("/record_solved_riddle", async (req, res) => {
  try {
    const { player_id, riddle_id, time_to_solve } = req.body;
    const score = await playerCtrl.recordSolvedRiddle(
      player_id,
      riddle_id,
      time_to_solve
    );
    res.json(score);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to record solved riddle.", details: err.message });
  }
});

/**
 * GET /api/players/unsolved_riddles/:player_id
 * Retrieves riddles that a player hasn't solved yet
 * @route GET /api/players/unsolved_riddles/:player_id
 * @param {string} req.params.player_id - Player ID
 * @param {string} [req.query.difficulty] - Optional difficulty filter
 * @returns {Array} Array of unsolved riddles for the player
 */
playerRouter.get("/unsolved_riddles/:player_id", async (req, res) => {
  try {
    const player_id = Number(req.params.player_id);
    const difficulty = req.query.difficulty;
    const riddles = await playerCtrl.getUnsolvedRiddles(player_id, difficulty);
    res.json(riddles);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to get unsolved riddles.", details: err.message });
  }
});

/**
 * POST /api/players/logout
 * Logs out a player by clearing their authentication token
 * @route POST /api/players/logout
 * @returns {Object} Logout confirmation message
 */
playerRouter.post("/logout", (req, res) => {
  // Clear token cookie from multiple possible paths
  res.clearCookie("token");
  res.clearCookie("token", { path: "/" });
  res.clearCookie("token", { path: "/api/" });
  res.json({ message: "Logged out successfully" });
});

export default playerRouter;
