import * as crud from "../DAL/crud.js";

const playerDbPath = "C:\\JSProjects\\RiddleGame\\server\\DAL\\players\\playerDb.txt";

export async function getOrCreatePlayer(name) {
    try {
        validatePlayerName(name);
        let players = await crud.read(playerDbPath);
        let player = players.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (!player) {
            const newId = getNextPlayerId(players);
            player = { id: newId, name, lowestTime: null };
            await crud.create(player, playerDbPath);
        }
        return player;
    } catch (err) {
        throw new Error("Could not get or create player: " + err.message);
    }
}

export async function getLeaderboard() {
    try {
        const players = await crud.read(playerDbPath);
        return players
            .filter(p => typeof p.lowestTime === "number")
            .sort((a, b) => a.lowestTime - b.lowestTime);
    } catch (err) {
        throw new Error("Could not get leaderboard: " + err.message);
    }
}

function getNextPlayerId(players) {
    return players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
}

function validatePlayerName(name) {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Invalid player name.");
    }
}

export async function updatePlayerTime(id, time) {
    try {
        const players = await crud.read(playerDbPath);
        const player = players.find(p => p.id === id);
        if (!player) throw new Error("Player not found");
        if (player.lowestTime === null || time < player.lowestTime) {
            await crud.update(id, { lowestTime: time }, playerDbPath);
        }
    } catch (err) {
        throw new Error("Could not update player time: " + err.message);
    }
}

export const playerCtrl = {
    getOrCreatePlayer,
    getLeaderboard,
    updatePlayerTime
};
