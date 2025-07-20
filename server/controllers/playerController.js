import * as crud from "../DAL/playerCrud.js";

export async function getOrCreatePlayer(username) {
    try {
        validatePlayerName(username);
        let player = await crud.readByUsername(username);
        if (!player) {
            player = { username, lowestTime: null };
            player = await crud.create(player);
        }
        return player;
    } catch (err) {
        throw new Error("Could not get or create player: " + err.message);
    }
}

export async function getLeaderboard() {
    try {
        const players = await crud.read();
        return players
            .filter(p => typeof p.lowestTime === "number")
            .sort((a, b) => a.lowestTime - b.lowestTime);
    } catch (err) {
        throw new Error("Could not get leaderboard: " + err.message);
    }
}

function validatePlayerName(name) {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Invalid player name.");
    }
}

export async function updatePlayerTime(id, time) {
    try {
        const player = await crud.readById(id);
        if (!player) throw new Error("Player not found");
        if (player.lowestTime === null || time < player.lowestTime) {
            await crud.update(id, { lowestTime: time });
        }
    } catch (err) {
        console.log(err.message);

        throw new Error("Could not update player time: " + err.message);
    }
}

export const playerCtrl = {
    getOrCreatePlayer,
    getLeaderboard,
    updatePlayerTime
};