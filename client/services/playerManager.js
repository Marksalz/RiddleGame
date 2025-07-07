import { getOrCreatePlayer, updatePlayerTime, getLeaderboard } from "../../server/services/playerService.js";

export async function welcomePlayer(name) {
    let player = await getOrCreatePlayer(name);
    if (player.lowestTime !== null) {
        console.log(`Hi ${player.name}! Your previous lowest time was ${player.lowestTime} seconds.\n`);
    } else {
        console.log(`Hi ${player.name}! Welcome to your first game!\n`);
    }
    return player;
}

export async function updatePlayerLowestTime(id, time) {
    await updatePlayerTime(id, time);
}

export async function viewLeaderboard() {
    try {
        const ranked = await getLeaderboard();
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