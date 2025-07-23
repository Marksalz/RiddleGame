/**
 * @fileoverview Player management layer handling authentication flows and user interactions.
 * Manages the complete user authentication experience including login, signup, and session management.
 * Integrates with player service and provides console-based user interface for authentication.
 * @author RiddleGame Team
 */

import * as playerService from '../services/playerService.js'
import { Player } from '../classes/Player.js';
import readline from 'readline-sync';

/**
 * Handles complete player authentication flow with multiple scenarios
 * @param {string} username - Username to authenticate
 * @returns {Promise<Player|null>} Authenticated Player instance or null if failed
 * @description
 * Authentication flow handles:
 * - Existing authenticated users (valid token)
 * - Expired token scenarios (re-login required)
 * - Existing users without valid token (login required)
 * - New users (signup or guest play options)
 * @example
 * const player = await authenticatePlayer('john_doe');
 * if (player) {
 *   console.log(`Welcome ${player.username}, role: ${player.role}`);
 * }
 */
export async function authenticatePlayer(username) {
    try {
        // Step 1: Check if user exists and validate any existing token
        const checkResult = await playerService.checkUser(username);

        if (checkResult.error) {
            console.log(`Error checking user: ${checkResult.error}`);
            if (checkResult.details) console.log(`Details: ${checkResult.details}`);
            return null;
        }

        // Step 2: Handle already authenticated user with valid token
        if (checkResult.authenticated) {
            const user = checkResult.user;
            console.log(`Welcome back, ${user.username}! You're already logged in.`);
            console.log(`Role: ${user.role || 'guest'}`);
            return new Player(user.id, user.username, user.lowestTime, user.role);
        }

        // Step 3: Handle expired token scenario
        if (checkResult.tokenExpired) {
            console.log(`Your session has expired. Please log in again.`);
            if (checkResult.userExists) {
                const password = readline.question('Enter your password: ', { hideEchoBack: true });
                const loginResult = await playerService.loginWithName(username, password);

                if (loginResult.error) {
                    console.log(`Login failed: ${loginResult.error}`);
                    return null;
                }

                const user = loginResult.user;
                console.log(`Welcome back, ${user.username}! Session renewed.`);
                console.log(`Role: ${user.role || 'guest'}`);
                return new Player(user.id, user.username, user.lowestTime, user.role);
            }
        }

        // Step 4: Handle existing user who needs to log in
        if (checkResult.userExists) {
            const password = readline.question('Enter your password: ', { hideEchoBack: true });
            const loginResult = await playerService.loginWithName(username, password);

            if (loginResult.error) {
                console.log(`Login failed: ${loginResult.error}`);
                return null;
            }

            const user = loginResult.user;
            console.log(`Welcome back, ${user.username}!`);
            console.log(`Role: ${user.role || 'guest'}`);
            return new Player(user.id, user.username, user.lowestTime, user.role);
        }

        // Step 5: Handle new user - offer guest play or account creation
        console.log(`\nUser '${username}' not found. How would you like to proceed?`);
        console.log("1. Play as guest (username only, limited features)");
        console.log("2. Create account (username + password, full features)");

        const choice = readline.question('Choose option (1 or 2): ');

        if (choice === '1') {
            // Guest play using legacy method
            const guestResult = await playerService.getOrCreatePlayer(username);

            if (guestResult.error) {
                console.log(`Failed to create guest player: ${guestResult.error}`);
                return null;
            }

            console.log(`Welcome, ${guestResult.username}! Playing as guest.`);
            console.log(`Role: guest (limited features)`);
            return new Player(guestResult.id, guestResult.username, guestResult.lowestTime, 'guest');
        }
        else if (choice === '2') {
            // Account creation flow with password confirmation
            const password = readline.question('Enter a password: ', { hideEchoBack: true });
            const confirmPassword = readline.question('Confirm password: ', { hideEchoBack: true });

            if (password !== confirmPassword) {
                console.log('Passwords do not match.');
                return null;
            }

            const signupResult = await playerService.signup(username, password, 'user');

            if (signupResult.error) {
                console.log(`Signup failed: ${signupResult.error}`);
                return null;
            }

            console.log(`Account created successfully! Welcome, ${signupResult.username}!`);
            console.log(`Role: user (full features)`);
            return new Player(signupResult.id, signupResult.username, signupResult.lowestTime, signupResult.role);
        }
        else {
            console.log('Invalid choice.');
            return null;
        }
    } catch (err) {
        console.log(`Authentication error: ${err.message}`);
        return null;
    }
}

/**
 * Legacy player check method for simple username-based access
 * @param {string} username - Username to check or create
 * @returns {Promise<Player|null>} Player instance or null if failed
 * @deprecated Use authenticatePlayer() for full authentication flow
 */
export async function checkPlayer(username) {
    const player = await playerService.getOrCreatePlayer(username);
    if (player.error) {
        console.log(`Error: ${player.error}`);
        if (player.details) console.log(`Details: ${player.details}`);
        return null;
    }
    if (player.lowestTime !== null) {
        console.log(`Hi ${player.username}! Your previous lowest time was ${player.lowestTime} seconds.\n`);
    } else {
        console.log(`Hi ${player.username}! Welcome to your first game!\n`);
    }
    return new Player(player.id, player.username, player.lowestTime);
}

/**
 * Updates a player's best completion time on the server
 * @param {number} id - Player ID
 * @param {number} time - New completion time in seconds
 * @param {string} username - Username for authentication
 * @description Only updates if the new time is better than the current best time
 */
export async function updatePlayerLowestTime(id, time, username) {
    const result = await playerService.updatePlayerTime(id, time, username);
    if (result && result.error) {
        console.log(`Error updating player time: ${result.error}`);
        if (result.details) console.log(`Details: ${result.details}`);
    }
}

/**
 * Displays the game leaderboard showing top players by completion time
 * @description Fetches and displays leaderboard data, handles empty states and errors
 * @example
 * await viewLeaderboard();
 * // Output:
 * // Leaderboard (Lowest Time):
 * // 1. alice - 45.2 seconds
 * // 2. bob - 52.1 seconds
 */
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
        console.log(`${i + 1}. ${p.username} - ${p.lowestTime} seconds`);
    });
}