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
    return new Promise((res) => { setTimeout(res, ms) });
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

export async function recordSolvedRiddle(player_id, riddle_id, time_to_solve) {
    try {
        const res = await fetch(`${BASE_URL}/record_solved_riddle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player_id, riddle_id, time_to_solve })
        });
        return await handleResponse(res, "record solved riddle");
    } catch (err) {
        return { error: "Network error: Failed to record solved riddle.", details: err.message };
    }
}

export async function getUnsolvedRiddles(player_id, difficulty) {
    try {
        let url = `${BASE_URL}/unsolved_riddles/${player_id}`;
        if (difficulty) url += `?difficulty=${encodeURIComponent(difficulty)}`;
        const res = await fetch(url);
        return await handleResponse(res, "get unsolved riddles");
    } catch (err) {
        return { error: "Network error: Failed to get unsolved riddles.", details: err.message };
    }
}

export async function checkUser(username) {
    try {
        const res = await fetch(`${BASE_URL}/check-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        return await handleResponse(res, "check user");
    } catch (err) {
        return { error: "Network error: Failed to check user.", details: err.message };
    }
}

export async function loginWithName(username, password) {
    try {
        const res = await fetch(`${BASE_URL}/login-with-name`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include', // Include cookies
            body: JSON.stringify({ username, password })
        });
        return await handleResponse(res, "login");
    } catch (err) {
        return { error: "Network error: Failed to login.", details: err.message };
    }
}

export async function signup(username, password, role = 'guest') {
    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ username, password, role })
        });
        return await handleResponse(res, "signup");
    } catch (err) {
        return { error: "Network error: Failed to signup.", details: err.message };
    }
}