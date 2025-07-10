import * as playerService from '../services/playerService.js'
import { Player } from '../classes/Player.js';

export async function checkPlayer(name) {
    const player = await playerService.getOrCreatePlayer(name);
    if (player.error) {
        console.log(`Error: ${player.error}`);
        if (player.details) console.log(`Details: ${player.details}`);
        return null;
    }
    if (player.lowestTime !== null) {
        console.log(`Hi ${player.name}! Your previous lowest time was ${player.lowestTime} seconds.\n`);
    } else {
        console.log(`Hi ${player.name}! Welcome to your first game!\n`);
    }
    return new Player(player.id, player.name, player.lowestTime);
}

export async function updatePlayerLowestTime(id, time) {
    const result = await playerService.updatePlayerTime(id, time);
    if (result && result.error) {
        console.log(`Error updating player time: ${result.error}`);
        if (result.details) console.log(`Details: ${result.details}`);
    }
}

export async function viewLeaderboard() {
    const ranked = await playerService.getLeaderboard();
    if (ranked.error) {
        console.log(`Failed to load leaderboard: ${ranked.error}`);
        if (ranked.details) console.log(`Details: ${ranked.details}`);
        return;
    }
    if (ranked.length === 0) {
        console.log("No leaderboard data available yet.");
        return;
    }
    console.log("Leaderboard (Lowest Time):");
    ranked.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.lowestTime} seconds`);
    });
}