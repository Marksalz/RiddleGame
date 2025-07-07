import { create, read, update } from "../modules/crud.js";

const playerDbPath = "C:\\JSProjects\\RiddleGame\\DAL\\players\\playerDb.txt";

/**
 * Returns the next available player id based on the current players array.
 * @param {Array} players 
 * @returns {number}
 */
function getNextPlayerId(players) {
    return players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
}

export async function welcomePlayer(name) {
    let players = read(playerDbPath);
    // try {
    //     players = JSON.parse(await readFile(playerDbPath, 'utf8'));
    // } catch (err) {
    //     players = [];
    // }

    let player = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (player) {
        if (player.lowestTime !== undefined) {
            console.log(`Hi ${player.name}! Your previous lowest time was ${player.lowestTime} seconds.\n`);
        } else {
            console.log(`Hi ${player.name}! Welcome back!\n`);
        }
    } else {
        const newId = getNextPlayerId(players);
        const newPlayer = { id: newId, name, lowestTime: undefined };
        create(newPlayer, playerDbPath);
        // players.push({ id: newId, name, lowestTime: undefined });
        // await writeFile(playerDbPath, JSON.stringify(players, null, 2), "utf8");
        console.log(`Hi ${name}! Welcome to your first game!\n`);
    }
}

export async function updatePlayerLowestTime(id, time) {
    update(id, { ["lowestTime"]: time });
}


export async function viewLeaderboard() {
    try {
        const players = await read(playerDbPath);

        const ranked = players
            .filter(p => typeof p.lowestTime === "number")
            .sort((a, b) => a.lowestTime - b.lowestTime);

        if (ranked.length === 0) {
            console.log("No leaderboard data available yet.");
            return;
        }

        console.log("Leaderboard (Lowest Time):");
        ranked.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - ${p.lowestTime} seconds`);
        });
    } catch (err) {
        console.log("Failed to load leaderboard:", err.message);
    }
}