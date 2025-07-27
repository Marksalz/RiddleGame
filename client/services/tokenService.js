/**
 * @fileoverview Token management service for JWT authentication.
 * Handles token storage, retrieval, and HTTP header management for authenticated requests.
 * Tokens are persisted to file system for session continuity across application restarts.
 * @author RiddleGame Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

// Token storage file path - stores authentication tokens locally
const TOKEN_FILE = path.join(process.cwd(), '.auth-tokens.json');

// In-memory token cache for faster access during runtime
let tokenCache = loadTokensFromFile();

/**
 * Loads authentication tokens from the local file system
 * @returns {Object} Object containing username->token mappings
 * @private
 */
function loadTokensFromFile() {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            const data = fs.readFileSync(TOKEN_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.log('Note: Could not load saved tokens:', err.message);
    }
    return {};
}

/**
 * Saves tokens to the local file system for persistence
 * @param {Object} [tokens] - Token object to save, defaults to current cache
 * @private
 */
function saveTokensToFile(tokens = null) {
    try {
        const tokensToSave = tokens || tokenCache;
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokensToSave, null, 2));
    } catch (err) {
        console.log('Note: Could not save tokens:', err.message);
    }
}

/**
 * Stores an authentication token for a specific user
 * @param {string} username - Username to associate with the token
 * @param {string} token - JWT token to store
 */
export function setToken(username, token) {
    tokenCache[username] = token;
    saveTokensToFile();
}

/**
 * Retrieves the stored authentication token for a user
 * @param {string} username - Username to get token for
 * @returns {string|null} JWT token or null if not found
 */
export function getToken(username) {
    return tokenCache[username] || null;
}

/**
 * Removes the stored authentication token for a user
 * @param {string} username - Username to clear token for
 * @example
 * clearToken('john_doe'); // User will need to log in again
 */
export function clearToken(username) {
    delete tokenCache[username];
    saveTokensToFile();
}

/**
 * Checks if a user has a valid stored token
 * @param {string} username - Username to check
 * @returns {boolean} True if user has a token stored
 * @example
 * if (hasValidToken('john_doe')) {
 *   // Proceed with authenticated request
 * }
 */
export function hasValidToken(username) {
    return !!getToken(username);
}

/**
 * Generates HTTP headers for API requests with optional authentication
 * @param {string|null} [username=null] - Username for token inclusion
 * @param {boolean} [includeToken=true] - Whether to include authentication token
 * @returns {Object} HTTP headers object ready for fetch requests
 */
export function getHeaders(username = null, includeToken = true) {
    const headers = {
        "Content-Type": "application/json"
    };

    // Add authentication token to Cookie header if requested
    if (includeToken && username) {
        const token = getToken(username);
        if (token) {
            headers.Cookie = `token=${token}`;
        }
    }

    return headers;
}
