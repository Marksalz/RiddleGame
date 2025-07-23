const PORT = process.env.PORT;

const BASE_URL = `http://localhost:${PORT}/api/riddles`;

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

export async function readAllRiddles(difficulty) {
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