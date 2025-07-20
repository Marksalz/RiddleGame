import { playerSupabase } from "../lib/players/playerDb.js";

const TABLE = "players";

export async function create(player) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .insert([player])
        .select();
    if (error) throw error;
    return data[0];
}

export async function read() {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .select("*");
    if (error) throw error;
    return data;
}

export async function readById(id) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

export async function readByUsername(username) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .select("*")
        .ilike("username", username)
        .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
}

export async function update(id, updates) {
    const { data, error } = await playerSupabase
        .from(TABLE)
        .update(updates)
        .eq("id", id)
        .select();
    if (error) throw error;
    return data[0];
}

export async function remove(id) {
    const { error } = await playerSupabase
        .from(TABLE)
        .delete()
        .eq("id", id);
    if (error) throw error;
}