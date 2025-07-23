import "dotenv/config";
import * as tokenService from './tokenService.js';

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
            headers: tokenService.getHeaders(null, false),
            body: JSON.stringify({ name })
        });
        return await handleResponse(res, "create or get player");
    } catch (err) {
        return { error: "Network error: Failed to create or get player.", details: err.message };
    }
}

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

export async function loginWithName(username, password) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/login-with-name`, {
            method: "POST",
            headers: tokenService.getHeaders(null, false),
            body: JSON.stringify({ username, password })
        });

        const result = await handleResponse(res, "login");

        if (result && result.token && !result.error) {
            tokenService.setToken(username, result.token);
            console.log(`Login successful! Token saved for ${username}. Expires in ${result.expiresIn || '1 week'}.`);
        }

        return result;
    } catch (err) {
        return { error: "Network error: Failed to login.", details: err.message };
    }
}

export async function signup(username, password, role = 'user') {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: tokenService.getHeaders(null, false),
            body: JSON.stringify({ username, password, role })
        });

        const result = await handleResponse(res, "signup");

        if (result && result.token && !result.error) {
            tokenService.setToken(username, result.token);
            console.log(`Signup successful! Token saved for ${username}. Expires in ${result.expiresIn || '1 week'}.`);
        }

        return result;
    } catch (err) {
        return { error: "Network error: Failed to signup.", details: err.message };
    }
}

export async function logout(username) {
    try {
        await delay(1000);
        const res = await fetch(`${BASE_URL}/logout`, {
            method: "POST",
            headers: tokenService.getHeaders(username)
        });

        // Clear user's token
        tokenService.clearToken(username);
        console.log(`Logged out successfully. Token removed for ${username}.`);

        return await handleResponse(res, "logout");
    } catch (err) {
        return { error: "Network error: Failed to logout.", details: err.message };
    }
}

export function hasToken(username) {
    return tokenService.hasValidToken(username);
}