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

// תיעוד
// טעינה דינמית של קבצים
// try catch


