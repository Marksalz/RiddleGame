import "dotenv/config";

const PORT = process.env.PORT || 3000;

const BASE_URL = `http://localhost:${PORT}/api/players`;

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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getOrCreatePlayer(name) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/create_player`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        return await handleResponse(res, "create or get player");
    } catch (err) {
        return { error: "Network error: Failed to create or get player.", details: err.message };
    }
}

export async function updatePlayerTime(id, time) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/update_time/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ time })
        });
        return await handleResponse(res, "update player time");
    } catch (err) {
        return { error: "Network error: Failed to update player time.", details: err.message };
    }
}

export async function getLeaderboard() {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/leaderboard`);
        return await handleResponse(res, "fetch leaderboard");
    } catch (err) {
        return { error: "Network error: Failed to fetch leaderboard.", details: err.message };
    }
}