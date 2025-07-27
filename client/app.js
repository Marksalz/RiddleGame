/**
 * @fileoverview Main application entry point for the Riddle Game client.
 * Handles user authentication, menu navigation, and coordinates all game functionality.
 * Provides role-based access control and interactive console interface.
 * @author RiddleGame Team
 * @version 1.0.0
 */

import * as playerManager from './managers/playerManager.js';
import * as gameManager from './managers/gameManager.js'
import * as playerService from './services/playerService.js';
import readline from 'readline-sync';

/**
 * Main game application loop handling authentication and menu navigation
 * @description
 * Application flow:
 * 1. Welcome and username collection with validation
 * 2. User authentication (login/signup/guest options)
 * 3. Role-based menu display and navigation
 * 4. Feature access control based on user permissions
 * 5. logout and exit handling
 */
export async function runGame() {
    console.log("Welcome to the Riddle game! ");

    // Authentication Phase - retry until successful
    let player = null;
    while (!player) {
        const username = readline.question('Enter your username: ');

        // Validate username input
        if (!username || username.trim().length === 0) {
            console.log("Username cannot be empty. Please try again.");
            continue;
        }

        console.log("Checking authentication...\n");
        player = await playerManager.authenticatePlayer(username.trim());

        if (!player) {
            console.log("Authentication failed. Please try again.\n");
        }
    }

    // Main Game Loop - continue until user exits
    let exit = false;
    while (!exit) {
        // Display role-based menu with permission indicators
        console.log(`\n=== Riddle Game Menu (Role: ${player.role}) ===`);
        console.log("1. Play the game");

        // Riddle creation - show access level
        if (player.canCreateRiddles()) {
            console.log("2. Create a new riddle");
        } else {
            console.log("2. Create a new riddle (requires user account)");
        }

        // View all riddles - show access level
        if (player.canViewAllRiddles()) {
            console.log("3. Read all riddles");
        } else {
            console.log("3. Read all riddles (requires user account)");
        }

        // Admin-only features - show access level
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

        // Conditional logout option for authenticated users
        if (playerService.hasToken(player.username)) {
            console.log("7. Logout");
            console.log("0. Exit");
        } else {
            console.log("0. Exit");
        }

        const choice = readline.question('Enter your choice: ');
        console.log();

        // Menu navigation with permission enforcement
        switch (choice) {
            case '1':
                // Game play - available to all users
                await gameManager.handlePlayGame(player);
                break;
            case '2':
                // Riddle creation - user/admin only
                if (player.canCreateRiddles()) {
                    await gameManager.handleCreateRiddle();
                } else {
                    console.log("You need a user account to create riddles. Create an account to unlock this feature!");
                }
                break;
            case '3':
                // View all riddles - user/admin only
                if (player.canViewAllRiddles()) {
                    await gameManager.handleReadAllRiddles();
                } else {
                    console.log("You need a user account to view all riddles. Create an account to unlock this feature!");
                }
                break;
            case '4':
                // Edit riddles - admin only
                if (player.canEditRiddles()) {
                    await gameManager.handleUpdateRiddle();
                } else {
                    console.log("You need admin privileges to edit riddles.");
                }
                break;
            case '5':
                // Delete riddles - admin only
                if (player.canDeleteRiddles()) {
                    await gameManager.handleDeleteRiddle();
                } else {
                    console.log("You need admin privileges to delete riddles.");
                }
                break;
            case '6':
                // Leaderboard - available to all users
                await playerManager.viewLeaderboard();
                break;
            case '7':
                // Logout - only available for authenticated users
                if (playerService.hasToken(player.username)) {
                    const logoutResult = await playerService.logout(player.username);
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
                // Exit application
                exit = true;
                console.log("Goodbye!");
                break;
            default:
                console.log("Invalid choice. Please try again.");
        }
        console.log();
    }
}

// Application entry point - start the game
runGame();