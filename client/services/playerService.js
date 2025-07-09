const BASE_URL = "http://localhost:4545/api/players";

export async function getOrCreatePlayer(name) {
    const res = await fetch(`${BASE_URL}/create_player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updatePlayerTime(id, time) {
    const res = await fetch(`${BASE_URL}/update_time/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getLeaderboard() {
    const res = await fetch(`${BASE_URL}/leaderboard`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}