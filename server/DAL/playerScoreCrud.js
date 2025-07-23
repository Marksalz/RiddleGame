import { playerSupabase } from "../lib/players/playerDb.js";

export async function createScore({ player_id, riddle_id, time_to_solve }) {
    const { data, error } = await playerSupabase
        .from("player_scores")
        .insert([{ player_id, riddle_id, time_to_solve }])
        .select();
    if (error) throw new Error(error.message);
    return data;
}

export async function getSolvedRiddleIds(player_id) {
    //console.log(`[getSolvedRiddleIds] Fetching solved riddle IDs for player_id: ${player_id}`);
    const { data, error } = await playerSupabase
        .from("player_scores")
        .select("riddle_id")
        .eq("player_id", player_id);
    if (error) {
        //console.error(`[getSolvedRiddleIds] Error fetching riddle IDs for player_id ${player_id}:`, error.message);
        throw new Error(error.message);
    }
    const riddleIds = data.map(row => row.riddle_id);
    //console.log(`[getSolvedRiddleIds] Found ${riddleIds.length} solved riddles for player_id ${player_id}:`, riddleIds);
    return riddleIds;
}
