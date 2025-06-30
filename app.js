/**
 * Riddle Game Application
 * 
 * This script is the entry point for the Riddle Game.
 * It prompts the user for their name and difficulty level,
 * loads riddles accordingly, and manages the game flow.
 * 
 * Main Steps:
 * 1. Greet the user and get their name.
 * 2. Ask for the desired difficulty level.
 * 3. Load riddles for the chosen level.
 * 4. Present each riddle to the player with a timer.
 * 5. Show the player's statistics at the end.
 * 
 * Dependencies:
 * - Player class (./classes/Player.js)
 * - Game manager functions (./game/gameManager.js)
 * - readline-sync for user input
 */

import { Player } from './classes/Player.js';
import * as gameManager from './game/gameManager.js';
import readline from 'readline-sync';


function main() {
    console.log("Welcome to the Riddle game! ");
    const name = readline.question('What is your name? ');
    console.log();
    const player = new Player(name);
    const level = readline.question('Choose difficulty: easy / medium / hard: ');
    console.log();
    let riddles = gameManager.loadRiddles(level);
    riddles.forEach(riddle => {
        gameManager.timedAsk(riddle, player)();
    });
    player.showStats();
}

main();


// טעינה דינמית של קבצים
// try catch


