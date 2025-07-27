import { playerSupabase } from "../lib/players/playerDb.js";

const TABLE = "players";

/**
 * Creates a new player in the database
 * @param {Object} player - The player object to create
 * @returns {Promise<Object>} The created player record
 * @throws {Error} If database operation fails
 */
export async function create(player) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .insert([player])
        .select();
    if (error) throw error;
    return data[0];
}

/**
 * Retrieves all players from the database
 * @returns {Promise<Array<Object>>} Array of all player records
 * @throws {Error} If database operation fails
 */
export async function read() {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .select("*");
    if (error) throw error;
    return data;
}

/**
 * Retrieves a player by their ID
 * @param {string} id - The player ID
 * @returns {Promise<Object>} The player record
 * @throws {Error} If database operation fails or player not found
 */
export async function readById(id) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

/**
 * Retrieves a player by their username (case-insensitive)
 * @param {string} username - The username to search for
 * @returns {Promise<Object|null>} The player record or null if not found
 * @throws {Error} If database operation fails (excluding not found errors)
 */
export async function readByUsername(username) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .select("*")
        .ilike("username", username)
        .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
}

/**
 * Updates a player's information
 * @param {string} id - The player ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} The updated player record
 * @throws {Error} If database operation fails
 */
export async function update(id, updates) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .update(updates)
        .eq("id", id)
        .select();
    if (error) throw error;
    return data[0];
}

/**
 * Removes a player from the database
 * @param {string} id - The player ID to remove
 * @returns {Promise<void>}
 * @throws {Error} If database operation fails
 */
export async function remove(id) {
    const { error } = await playerSupabase
        .from(TABLE)
        .delete()
        .eq("id", id);
    if (error) throw error;
}