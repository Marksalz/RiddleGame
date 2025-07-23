import * as crud from "../DAL/playerCrud.js";
import * as scoreCrud from "../DAL/playerScoreCrud.js";
import * as riddleCrud from "../DAL/riddleCrud.js";

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

export async function createPlayer(username, hashedPassword, role = 'guest') {
    try {
        validatePlayerName(username);
        let player = { username, password: hashedPassword, role, lowestTime: null };
        player = await crud.create(player);
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

export async function recordSolvedRiddle(player_id, riddle_id, time_to_solve) {
    try {
        return await scoreCrud.createScore({ player_id, riddle_id, time_to_solve });
    } catch (err) {
        throw new Error("Could not record solved riddle: " + err.message);
    }
}

export async function getUnsolvedRiddles(player_id, difficulty) {
    try {
        const solvedIds = await scoreCrud.getSolvedRiddleIds(player_id);
        console.log(solvedIds);
        let riddles = await riddleCrud.getRiddles();
        if (difficulty) {
            riddles = riddles.filter(r => r.difficulty === difficulty);
        }
        return riddles.filter(r => !solvedIds.includes(String(r._id)));
    } catch (err) {
        throw new Error("Could not get unsolved riddles: " + err.message);
    }
}

export const playerCtrl = {
    getOrCreatePlayer,
    createPlayer,
    getLeaderboard,
    updatePlayerTime,
    recordSolvedRiddle,
    getUnsolvedRiddles
};