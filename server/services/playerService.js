import { create, read, update } from "../DAL/crud.js";

const playerDbPath = "C:\\JSProjects\\RiddleGame\\server\\DAL\\players\\playerDb.txt";

function getNextPlayerId(players) {
    return players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
}

export async function getOrCreatePlayer(name) {
    let players = await read(playerDbPath);
    let player = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!player) {
        const newId = getNextPlayerId(players);
        player = { id: newId, name, lowestTime: null };
        await create(player, playerDbPath);
    }
    return player;
}

export async function updatePlayerTime(id, time) {
    const players = await read(playerDbPath);
    const player = players.find(p => p.id === id);
    if (!player) throw new Error("Player not found");
    if (player.lowestTime === null || time < player.lowestTime) {
        await update(id, { lowestTime: time }, playerDbPath);
    }
}

export async function getLeaderboard() {
    const players = await read(playerDbPath);
    return players
        .filter(p => typeof p.lowestTime === "number")
        .sort((a, b) => a.lowestTime - b.lowestTime);
}
