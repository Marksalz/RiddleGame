const BASE_URL = "http://localhost:4545/api/riddles";

export async function createRiddle(riddle) {
    const res = await fetch(`${BASE_URL}/create_riddle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riddle)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function readAllRiddles() {
    const res = await fetch(`${BASE_URL}/read_all_riddles`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updateRiddle(id, field, value) {
    const res = await fetch(`${BASE_URL}/update_riddle/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteRiddle(id) {
    const res = await fetch(`${BASE_URL}/delete_riddle/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}