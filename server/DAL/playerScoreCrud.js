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
    const { data, error } = await playerSupabase
        .from("player_scores")
        .select("riddle_id")
        .eq("player_id", player_id);
    if (error) throw new Error(error.message);
    return data.map(row => row.riddle_id);
}
