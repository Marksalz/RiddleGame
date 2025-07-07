import { Player } from './classes/Player.js';
import { Riddle } from './classes/Riddle.js';
import * as gameManager from './game/gameManager.js';
import * as playerManager from './game/playerManager.js'
import readline from 'readline-sync';


async function main() {
    Riddle.initializeNextIdFromDb();
    console.log("Welcome to the Riddle game! ");
    const name = readline.question('What is your name? ');
    console.log();

    let exit = false;
    const player = new Player(name);

    while (!exit) {
        console.log("What do you want to do?");
        console.log("1. Play the game");
        console.log("2. Create a new riddle");
        console.log("3. Read all riddles");
        console.log("4. Update an existing riddle");
        console.log("5. Delete a riddle");
        console.log("6. View leaderboard");
        console.log("0. Exit");
        const choice = readline.question('Enter your choice: ');

        switch (choice) {
            case '1':
                const level = readline.question('Choose difficulty: easy / medium / hard: ');
                console.log();
                let riddles = gameManager.loadRiddles(level);
                riddles.forEach(riddle => {
                    gameManager.timedAsk(riddle, player)();
                });
                player.showStats();
                break;
            case '2':
                await gameManager.createRiddle();
                break;
            case '3':
                await gameManager.readAllRiddles();
                break;
            case '4':
                await gameManager.updateRiddle();
                break;
            case '5':
                await gameManager.delete_r();
                break;
            case '6':
                playerManager.viewLeaderboard();
                break;
            case '0':
                exit = true;
                console.log("Goodbye!");
                break;
            default:
                console.log("Invalid choice. Please try again.");
        }
        console.log();
    }
}

main();