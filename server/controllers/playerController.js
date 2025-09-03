/**
 * @fileoverview Controller layer for player operations.
 * Handles authentication, player management, scoring, and game progress tracking.
 * @author RiddleGame Team
 */

import * as crud from "../DAL/playerCrud.js";
import * as scoreCrud from "../DAL/playerScoreCrud.js";
import * as riddleCrud from "../DAL/riddleCrud.js";
import { playerSupabase } from "../lib/players/playerDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Gets an existing player or creates a new one (legacy method)
 * @param {string} username - Player username
 * @returns {Object} Player object
 * @throws {Error} If validation or database operation fails
 */
export async function getOrCreatePlayerGuest(username, role) {
  try {
    validatePlayerName(username);
    let player = await crud.readByUsername(username);
    if (!player) {
      player = { username, role, lowestTime: null };
      player = await crud.create(player);
    }
    return player;
  } catch (err) {
    throw new Error("Could not get or create player: " + err.message);
  }
}

/**
 * Creates a new player with hashed password
 * @param {string} username - Player username
 * @param {string} hashedPassword - BCrypt hashed password
 * @param {string} [role='user'] - User role (guest, user, admin)
 * @returns {Object} Created player object
 * @throws {Error} If validation or creation fails
 */
export async function createPlayer(username, hashedPassword, role = "user") {
  try {
    validatePlayerName(username);
    let player = { username, password: hashedPassword, role, lowestTime: null };
    player = await crud.create(player);
    return player;
  } catch (err) {
    throw new Error("Could not get or create player: " + err.message);
  }
}

/**
 * Retrieves leaderboard sorted by best completion times
 * @returns {Array} Array of players sorted by lowestTime (ascending)
 * @throws {Error} If database operation fails
 */
export async function getLeaderboard() {
  try {
    const players = await crud.read();
    return players
      .filter((p) => typeof p.lowestTime === "number")
      .sort((a, b) => a.lowestTime - b.lowestTime);
  } catch (err) {
    throw new Error("Could not get leaderboard: " + err.message);
  }
}

/**
 * Validates player name format and content
 * @param {string} name - Player name to validate
 * @throws {Error} If name is invalid
 * @private
 */
function validatePlayerName(name) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Invalid player name.");
  }
}

/**
 * Updates a player's best completion time if the new time is better
 * @param {number} id - Player ID
 * @param {number} time - New completion time in seconds
 * @throws {Error} If player not found or update fails
 */
export async function updatePlayerTime(id, time) {
  try {
    const player = await crud.readById(id);
    if (!player) throw new Error("Player not found");
    if (player.lowestTime === null || time < player.lowestTime) {
      await crud.update(id, { lowestTime: time });
    }
  } catch (err) {
    console.log(err.message);

    throw new Error("Could not update player time: " + err.message);
  }
}

/**
 * Records a solved riddle for a player with completion time
 * @param {number} player_id - ID of the player
 * @param {string} riddle_id - MongoDB ObjectId of the riddle
 * @param {number} time_to_solve - Time taken to solve in seconds
 * @returns {Object} Created score record
 * @throws {Error} If recording fails
 */
export async function recordSolvedRiddle(player_id, riddle_id, time_to_solve) {
  try {
    return await scoreCrud.createScore({ player_id, riddle_id, time_to_solve });
  } catch (err) {
    throw new Error("Could not record solved riddle: " + err.message);
  }
}

/**
 * Gets riddles that a player hasn't solved yet
 * @param {number} player_id - Player ID
 * @param {string} [difficulty] - Optional difficulty filter
 * @returns {Array} Array of unsolved riddles
 * @throws {Error} If database operations fail
 */
export async function getUnsolvedRiddles(player_id, difficulty) {
  try {
    // Get list of riddle IDs the player has already solved
    const solvedIds = await scoreCrud.getSolvedRiddleIds(player_id);

    // Get all riddles, optionally filtered by difficulty
    let riddles = await riddleCrud.getRiddles();
    if (difficulty) {
      riddles = riddles.filter((r) => r.difficulty === difficulty);
    }

    // Filter out already solved riddles
    return riddles.filter((r) => !solvedIds.includes(String(r._id)));
  } catch (err) {
    throw new Error("Could not get unsolved riddles: " + err.message);
  }
}

/**
 * Handles guest role direct login without token
 * @param {Object} req - Express request object
 * @returns {Object|null} Guest authentication result or null
 * @private
 */
function handleGuestLogin(req) {
  if (req.guestLogin && req.user && req.user.role === "guest") {
    return {
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        lowestTime: req.user.lowestTime,
      },
      guestLogin: true,
      message: "Guest user authenticated without token",
    };
  }
  return null;
}

/**
 * Handles authenticated user with valid token
 * @param {string} username - Username to verify
 * @param {Object} req - Express request object
 * @returns {Object|null} Token authentication result or null
 * @private
 */
function handleTokenAuthentication(username, req) {
  if (req.authenticated && req.user && req.user.username === username) {
    return {
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role || "guest",
        lowestTime: req.user.lowestTime,
      },
      message: "User authenticated with existing token",
    };
  }
  return null;
}

/**
 * Handles token-related errors (expired or invalid)
 * @param {Object} req - Express request object
 * @returns {Object|null} Token error result or null
 * @private
 */
function handleTokenErrors(req) {
  if (req.tokenExpired) {
    return {
      authenticated: false,
      tokenExpired: true,
      userExists: req.userExists,
      tokenError: req.tokenError,
      message: "Token expired, please log in again",
    };
  }

  if (req.tokenError) {
    return {
      authenticated: false,
      tokenExpired: false,
      userExists: req.userExists,
      tokenError: req.tokenError,
      message: "Invalid token, please log in again",
    };
  }
  return null;
}

/**
 * Handles existing user scenarios
 * @param {Object} req - Express request object
 * @returns {Object} User existence result
 * @private
 */
function handleUserExistence(req) {
  if (req.userExists) {
    return {
      authenticated: false,
      userExists: true,
      message: "User exists, password required",
    };
  }

  return {
    authenticated: false,
    userExists: false,
    message: "User not found, signup required",
  };
}

/**
 * Checks user authentication status and token validity
 * @param {string} username - Username to check
 * @param {Object} req - Express request object with auth middleware data
 * @returns {Object} Authentication status and user information
 * @throws {Error} If authentication check fails
 */
export async function checkUserAuthentication(username, req) {
  try {
    // // log with the req
    // console.log(req);

    // Check authentication scenarios in priority order
    const guestResult = handleGuestLogin(req);
    if (guestResult) return guestResult;

    const tokenResult = handleTokenAuthentication(username, req);
    if (tokenResult) return tokenResult;

    const errorResult = handleTokenErrors(req);
    if (errorResult) return errorResult;

    return handleUserExistence(req);
  } catch (err) {
    throw new Error("Could not check user authentication: " + err.message);
  }
}

/**
 * Generates a JWT token for a user
 * @param {Object} user - User object with id, username, and role
 * @returns {string} JWT token
 * @private
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role || "user",
    },
    process.env.SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Creates a new player account with authentication
 * @param {string} username - Desired username
 * @param {string} password - Plain text password (will be hashed)
 * @param {string} [role='user'] - User role (guest, user, admin)
 * @returns {Object} Player data and JWT token
 * @throws {Error} If signup fails or role is invalid
 */
export async function signupPlayer(username, password, role = "user") {
  try {
    // Validate role
    const validRoles = ["guest", "user", "admin"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role specified");
    }

    // Hash password with 12 salt rounds for security
    const hashedPassword = await bcrypt.hash(password, 12);
    const player = await createPlayer(username, hashedPassword, role);

    // Generate JWT token with 7-day expiration
    const token = generateToken(player);

    return {
      player: player,
      token: token,
      expiresIn: "7d",
    };
  } catch (err) {
    throw new Error("Could not signup player: " + err.message);
  }
}

/**
 * Authenticates a player with username and password
 * @param {string} username - Player username
 * @param {string} password - Plain text password
 * @returns {Object} Authentication result with token and user data
 * @throws {Error} If login credentials are invalid
 */
export async function loginPlayer(username, password, checkToken) {
  try {
    // Find user by username
    const { data: user, error } = await playerSupabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      throw new Error("User not found");
    }

    // Verify password against stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid password");
    }
    let token = undefined;
    if (!checkToken) {
      // Generate new JWT token
      token = generateToken(user);
    } else {
      token = checkToken;
    }

    return {
      message: "Login successful!",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role || "guest",
        lowestTime: user.lowestTime,
      },
      expiresIn: "7d",
    };
  } catch (err) {
    throw new Error("Could not login player: " + err.message);
  }
}

export const playerCtrl = {
  getOrCreatePlayerGuest,
  createPlayer,
  getLeaderboard,
  updatePlayerTime,
  recordSolvedRiddle,
  getUnsolvedRiddles,
  checkUserAuthentication,
  signupPlayer,
  loginPlayer,
};
