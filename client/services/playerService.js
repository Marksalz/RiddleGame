/**
 * @fileoverview Service layer for player-related API operations.
 * Handles authentication, player management, scoring, and game progress.
 * Integrates with token service for secure API communication.
 * @author RiddleGame Team
 */

import "dotenv/config";
import * as tokenService from './tokenService.js';

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api/players`;

/**
 * Handles API response parsing and error extraction
 * @param {Response} res - Fetch API response object
 * @param {string} action - Description of the action for error messages
 * @returns {Object} Parsed response data or error object
 * @private
 */
async function handleResponse(res, action) {
    try {
        const data = await res.json();
        if (!res.ok) {
            return { error: `Failed to ${action}.`, details: data.error || data };
        }
        return data;
    } catch (err) {
        return { error: `Failed to ${action}.`, details: "Invalid server response." };
    }
}

/**
 * Adds artificial delay for better UX
 * @param {number} ms - Milliseconds to delay
 * @private
 */
function delay(ms) {
    return new Promise((res) => { setTimeout(res, ms) });
}

/**
 * Creates or retrieves a player
 * @param {string} name - Player username
 * @returns {Promise<Object>} Player object or error details
 */
export async function getOrCreatePlayerGuestMode(name) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/create_player`, {
            method: "POST",
            headers: tokenService.getHeaders(null, false),
            body: JSON.stringify({ name, role: "guest" })
        });
        return await handleResponse(res, "create or get player");
    } catch (err) {
        return { error: "Network error: Failed to create or get player.", details: err.message };
    }
}

/**
 * Updates a player's best completion time
 * @param {number} id - Player ID
 * @param {number} time - New completion time in seconds
 * @param {string} username - Username for authentication
 * @returns {Promise<Object>} Success message or error details
 */
export async function updatePlayerTime(id, time, username) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/update_time/${id}`, {
            method: "PUT",
            headers: tokenService.getHeaders(username),
            body: JSON.stringify({ time })
        });
        return await handleResponse(res, "update player time");
    } catch (err) {
        return { error: "Network error: Failed to update player time.", details: err.message };
    }
}

/**
 * Retrieves the game leaderboard sorted by best times
 * @returns {Promise<Array|Object>} Array of top players or error object
 * @example
 * const leaderboard = await getLeaderboard();
 * leaderboard.forEach((player, index) => {
 *   console.log(`${index + 1}. ${player.username}: ${player.lowestTime}s`);
 * });
 */
export async function getLeaderboard() {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/leaderboard`, {
            headers: tokenService.getHeaders(null, false) // Leaderboard doesn't need auth
        });
        return await handleResponse(res, "fetch leaderboard");
    } catch (err) {
        return { error: "Network error: Failed to fetch leaderboard.", details: err.message };
    }
}

/**
 * Records when a player solves a riddle with their completion time
 * @param {number} player_id - ID of the player
 * @param {string} riddle_id - MongoDB ObjectId of the solved riddle
 * @param {number} time_to_solve - Time taken to solve in seconds
 * @param {string} username - Username for authentication
 * @returns {Promise<Object>} Created score record or error details
 */
export async function recordSolvedRiddle(player_id, riddle_id, time_to_solve, username) {
    try {
        const res = await fetch(`${BASE_URL}/record_solved_riddle`, {
            method: "POST",
            headers: tokenService.getHeaders(username),
            body: JSON.stringify({ player_id, riddle_id, time_to_solve })
        });
        return await handleResponse(res, "record solved riddle");
    } catch (err) {
        return { error: "Network error: Failed to record solved riddle.", details: err.message };
    }
}

/**
 * Retrieves riddles that a player hasn't solved yet
 * @param {number} player_id - Player ID
 * @param {string} [difficulty] - Optional difficulty filter
 * @param {string} username - Username for authentication
 * @returns {Promise<Array|Object>} Array of unsolved riddles or error object
 */
export async function getUnsolvedRiddles(player_id, difficulty, username) {
    try {
        let url = `${BASE_URL}/unsolved_riddles/${player_id}`;
        if (difficulty) url += `?difficulty=${encodeURIComponent(difficulty)}`;
        const res = await fetch(url, {
            headers: tokenService.getHeaders(username)
        });
        return await handleResponse(res, "get unsolved riddles");
    } catch (err) {
        return { error: "Network error: Failed to get unsolved riddles.", details: err.message };
    }
}

/**
 * Checks if a user exists and validates their authentication status
 * @param {string} username - Username to check
 * @returns {Promise<Object>} Authentication status and user information
 */
export async function checkUser(username) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/check-user`, {
            method: "POST",
            headers: tokenService.getHeaders(username),
            body: JSON.stringify({ username })
        });

        return await handleResponse(res, "check user");
    } catch (err) {
        return { error: "Network error: Failed to check user.", details: err.message };
    }
}

/**
 * Authenticates a user with username and password
 * @param {string} username - Player username
 * @param {string} password - Player password
 * @returns {Promise<Object} Authentication result with token and user data
 */
export async function loginWithPassword(username, password) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/login-with-name`, {
            method: "POST",
            headers: tokenService.getHeaders(null, false), // No token needed for login
            body: JSON.stringify({ username, password })
        });

        const result = await handleResponse(res, "login");

        // Store token on successful login
        if (result && result.token && !result.error) {
            tokenService.setToken(username, result.token);
            console.log(`Login successful! Token saved for ${username}. Expires in ${result.expiresIn || '1 week'}.`);
        }

        return result;
    } catch (err) {
        return { error: "Network error: Failed to login.", details: err.message };
    }
}

/**
 * Creates a new user account with authentication
 * @param {string} username - Desired username
 * @param {string} password - Account password
 * @param {string} [role='user'] - User role (guest, user, admin)
 * @returns {Promise<Object>} Created user data with authentication token
 * @example
 * const result = await signup('new_user', 'secure_password', 'user');
 * if (result.error) {
 *   console.log('Signup failed:', result.error);
 * } else {
 *   console.log('Account created for:', result.username);
 * }
 */
export async function signup(username, password, role = 'user') {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: tokenService.getHeaders(null, false), // No token needed for signup
            body: JSON.stringify({ username, password, role })
        });

        const result = await handleResponse(res, "signup");

        // Store token on successful signup
        if (result && result.token && !result.error) {
            tokenService.setToken(username, result.token);
            console.log(`Signup successful! Token saved for ${username}. Expires in ${result.expiresIn || '1 week'}.`);
        }

        return result;
    } catch (err) {
        return { error: "Network error: Failed to signup.", details: err.message };
    }
}

/**
 * Logs out a user and clears their authentication token
 * @param {string} username - Username to log out
 * @returns {Promise<Object>} Logout confirmation or error details
 * @example
 * const result = await logout('john_doe');
 * console.log('Logout result:', result.message);
 */
export async function logout(username) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/logout`, {
            method: "POST",
            headers: tokenService.getHeaders(username) // Include token for logout
        });

        // Clear user's token locally regardless of server response
        tokenService.clearToken(username);
        console.log(`Logged out successfully. Token removed for ${username}.`);

        return await handleResponse(res, "logout");
    } catch (err) {
        return { error: "Network error: Failed to logout.", details: err.message };
    }
}

/**
 * Checks if a user has a valid authentication token stored locally
 * @param {string} username - Username to check
 * @returns {boolean} True if user has a stored token
 * @example
 * if (hasToken('john_doe')) {
 *   // User is likely authenticated
 * } else {
 *   // User needs to log in
 * }
 */
export function hasToken(username) {
    return tokenService.hasValidToken(username);
}