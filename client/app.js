import * as playerManager from './managers/playerManager.js';
import * as gameManager from './managers/gameManager.js'
import * as playerService from './services/playerService.js';
import readline from 'readline-sync';



export async function runGame() {
    console.log("Welcome to the Riddle game! ");

    let player = null;
    while (!player) {
        const username = readline.question('Enter your username: ');
        if (!username || username.trim().length === 0) {
            console.log("Username cannot be empty. Please try again.");
            continue;
        }

        console.log("Checking authentication...");
        player = await playerManager.authenticatePlayer(username.trim());

        if (!player) {
            console.log("Authentication failed. Please try again.\n");
        }
    }

    console.log();

    let exit = false;
    while (!exit) {
        console.log(`\n=== Riddle Game Menu (Role: ${player.role}) ===`);
        console.log("1. Play the game");

        if (player.canCreateRiddles()) {
            console.log("2. Create a new riddle");
        } else {
            console.log("2. Create a new riddle (requires user account)");
        }

        if (player.canViewAllRiddles()) {
            console.log("3. Read all riddles");
        } else {
            console.log("3. Read all riddles (requires user account)");
        }

        if (player.canEditRiddles()) {
            console.log("4. Update an existing riddle");
        } else {
            console.log("4. Update an existing riddle (admin only)");
        }

        if (player.canDeleteRiddles()) {
            console.log("5. Delete a riddle");
        } else {
            console.log("5. Delete a riddle (admin only)");
        }

        console.log("6. View leaderboard");

        // Add logout option for authenticated users
        if (playerService.hasToken()) {
            console.log("7. Logout");
            console.log("0. Exit");
        } else {
            console.log("0. Exit");
        }

        const choice = readline.question('Enter your choice: ');
        console.log();

        switch (choice) {
            case '1':
                await gameManager.handlePlayGame(player);
                break;
            case '2':
                if (player.canCreateRiddles()) {
                    await gameManager.handleCreateRiddle();
                } else {
                    console.log("You need a user account to create riddles. Create an account to unlock this feature!");
                }
                break;
            case '3':
                if (player.canViewAllRiddles()) {
                    await gameManager.handleReadAllRiddles();
                } else {
                    console.log("You need a user account to view all riddles. Create an account to unlock this feature!");
                }
                break;
            case '4':
                if (player.canEditRiddles()) {
                    await gameManager.handleUpdateRiddle();
                } else {
                    console.log("You need admin privileges to edit riddles.");
                }
                break;
            case '5':
                if (player.canDeleteRiddles()) {
                    await gameManager.handleDeleteRiddle();
                } else {
                    console.log("You need admin privileges to delete riddles.");
                }
                break;
            case '6':
                await playerManager.viewLeaderboard();
                break;
            case '7':
                if (playerService.hasToken()) {
                    const logoutResult = await playerService.logout();
                    if (logoutResult.error) {
                        console.log(`Logout failed: ${logoutResult.error}`);
                    } else {
                        console.log("You have been logged out successfully.");
                        exit = true;
                    }
                } else {
                    console.log("Invalid choice. Please try again.");
                }
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