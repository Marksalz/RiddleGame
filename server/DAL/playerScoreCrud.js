import { playerSupabase } from "../lib/players/playerDb.js";

/**
 * Creates a new player score record in the database
 * @param {Object} scoreData - The score data object
 * @param {string} scoreData.player_id - The ID of the player
 * @param {string} scoreData.riddle_id - The ID of the riddle
 * @param {number} scoreData.time_to_solve - Time taken to solve the riddle in seconds
 * @returns {Promise<Array>} The created score record
 * @throws {Error} If database operation fails
 */
export async function createScore({ player_id, riddle_id, time_to_solve }) {
    const { data, error } = await playerSupabase
        .from("player_scores")
        .insert([{ player_id, riddle_id, time_to_solve }])
        .select();
    if (error) throw new Error(error.message);
    return data;
}

/**
 * Retrieves all riddle IDs that a player has solved
 * @param {string} player_id - The ID of the player
 * @returns {Promise<Array<string>>} Array of solved riddle IDs
 * @throws {Error} If database operation fails
 */
export async function getSolvedRiddleIds(player_id) {
    const { data, error } = await playerSupabase
        .from("player_scores")
        .select("riddle_id")
        .eq("player_id", player_id);
    if (error) {
        throw new Error(error.message);
    }
    const riddleIds = data.map(row => row.riddle_id);
    return riddleIds;
}
