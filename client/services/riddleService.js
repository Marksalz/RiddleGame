/**
 * @fileoverview Service layer for riddle-related API operations.
 * Handles communication with the riddle endpoints on the server.
 * Provides CRUD operations and error handling for riddle management.
 * @author RiddleGame Team
 */

const PORT = process.env.PORT;

const BASE_URL = `http://localhost:${PORT}/api/riddles`;

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
 * Adds artificial delay for better UX (simulates network latency)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 * @private
 */
function delay(ms) {
    return new Promise((res) => { setTimeout(res, ms) });
}

/**
 * Creates a new riddle on the server
 * @param {Object} riddle - Riddle object to create
 * @param {string} riddle.name - Name/title of the riddle
 * @param {string} riddle.taskDescription - The riddle question
 * @param {string} riddle.correctAnswer - Correct answer
 * @param {string} riddle.difficulty - Difficulty level (easy, medium, hard)
 * @param {number} riddle.timeLimit - Time limit in seconds
 * @param {string} riddle.hint - Hint text
 * @param {Array} [riddle.choices] - Optional array of multiple choice options
 * @returns {Promise<Object>} Success message or error details
 */
export async function createRiddle(riddle) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/create_riddle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(riddle)
        });
        return await handleResponse(res, "create riddle");
    } catch (err) {
        return { error: "Network error: Failed to create riddle.", details: err.message };
    }
}

/**
 * Retrieves riddles from the server, optionally filtered by difficulty
 * @param {string} [difficulty] - Optional difficulty filter (easy, medium, hard)
 * @returns {Promise<Array|Object>} Array of riddles or error object
 */
export async function readAllRiddles(difficulty) {
    // Construct URL with optional difficulty parameter
    let url = "/read_all_riddles";
    if (difficulty) {
        url += `/${encodeURIComponent(difficulty)}`;
    }
    try {
        await delay(1000);
        const response = await fetch(BASE_URL + url);
        return await response.json();
    } catch (err) {
        return { error: "Failed to fetch riddles.", details: err.message };
    }
}

/**
 * Updates a specific field of an existing riddle
 * @param {string} id - MongoDB ObjectId of the riddle
 * @param {string} field - Field name to update
 * @param {*} value - New value for the field
 * @returns {Promise<Object>} Success message or error details
 */
export async function updateRiddle(id, field, value) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/update_riddle/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field, value })
        });
        return await handleResponse(res, "update riddle");
    } catch (err) {
        return { error: "Network error: Failed to update riddle.", details: err.message };
    }
}

/**
 * Deletes a riddle from the server
 * @param {string} id - MongoDB ObjectId of the riddle to delete
 * @returns {Promise<Object>} Success message or error details
 */
export async function deleteRiddle(id) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/delete_riddle/${id}`, {
            method: "DELETE"
        });
        return await handleResponse(res, "delete riddle");
    } catch (err) {
        return { error: "Network error: Failed to delete riddle.", details: err.message };
    }
}