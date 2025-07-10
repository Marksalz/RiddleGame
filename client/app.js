import * as playerManager from './managers/playerManager.js';
import * as gameManager from './managers/gameManager.js'
import readline from 'readline-sync';



export async function runGame() {
    console.log("Welcome to the Riddle game! ");
    let name;
    while (true) {
        name = readline.question('What is your name? ');
        if (name && name.trim().length > 0) break;
        console.log("Name cannot be empty. Please enter your name.");
    }
    console.log();

    let exit = false;
    const player = await playerManager.checkPlayer(name);
    if (!player) {
        console.log("Cannot continue without a valid player.");
        return;
    }

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
        console.log();

        switch (choice) {
            case '1':
                await gameManager.handlePlayGame(player);
                break;
            case '2':
                await gameManager.handleCreateRiddle();
                break;
            case '3':
                await gameManager.handleReadAllRiddles();
                break;
            case '4':
                await gameManager.handleUpdateRiddle();
                break;
            case '5':
                await gameManager.handleDeleteRiddle();
                break;
            case '6':
                await playerManager.viewLeaderboard();
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

runGame();