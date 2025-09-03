/**
 * @fileoverview Player management layer handling authentication flows and user interactions.
 * Manages the complete user authentication experience including login, signup, and session management.
 * Integrates with player service and provides console-based user interface for authentication.
 * @author RiddleGame Team
 */

import * as playerService from "../services/playerService.js";
import { Player } from "../classes/Player.js";
import readline from "readline-sync";

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
 */
export async function authenticatePlayer(username) {
  try {
    // Step 1: Check if user exists and validate any existing token
    const checkResult = await playerService.checkUser(username);

    if (checkResult.error) {
      console.log(`Error checking user: ${checkResult.error}`);
      if (checkResult.details) {
        if (typeof checkResult.details === "object") {
          console.log(`Details: ${JSON.stringify(checkResult.details)}`);
        } else {
          console.log(`Details: ${checkResult.details}`);
        }
      }
      return null;
    }

    // Step 2: Handle already authenticated user with valid token or guest login
    if (checkResult.authenticated) {
      const user = checkResult.user;
      if (checkResult.guestLogin) {
        console.log(`Welcome back, ${user.username}! Logging in as guest.`);
        console.log(`Role: guest (limited features)`);
      } else {
        console.log(
          `Welcome back, ${user.username}! You're already logged in.`
        );
        console.log(`Role: ${user.role || "guest"}`);
      }
      return new Player(user.id, user.username, user.lowestTime, user.role);
    }

    // Step 3: Handle expired token scenario
    if (checkResult.tokenExpired) {
      console.log(`Your session has expired. Please log in again.`);
      if (checkResult.userExists) {
        const password = readline.question("Enter your password: ", {
          hideEchoBack: true,
        });
        const loginResult = await playerService.loginWithPassword(
          username,
          password
        );

        if (loginResult.error) {
          console.log(`Login failed: ${loginResult.error}`);
          return null;
        }

        const user = loginResult.user;
        console.log(`Welcome back, ${user.username}! Session renewed.`);
        console.log(`Role: ${user.role || "guest"}`);
        return new Player(user.id, user.username, user.lowestTime, user.role);
      }
    }

    // Step 4: Handle existing user who needs to log in
    if (checkResult.userExists) {
      const password = readline.question("Enter your password: ", {
        hideEchoBack: true,
      });
      const loginResult = await playerService.loginWithPassword(
        username,
        password
      );

      if (loginResult.error) {
        console.log(`Login failed: ${loginResult.error}`);
        return null;
      }

      const user = loginResult.user;
      console.log(`Welcome back, ${user.username}!`);
      console.log(`Role: ${user.role || "guest"}`);
      return new Player(user.id, user.username, user.lowestTime, user.role);
    }

    // Step 5: Handle new user - offer guest play or account creation
    console.log(
      `\nUser '${username}' not found. How would you like to proceed?`
    );
    console.log("1. Play as guest (username only, limited features)");
    console.log("2. Create account (username + password, full features)");

    const choice = readline.question("Choose option (1 or 2): ");

    if (choice === "1") {
      return await checkAndWelcomeGuestPlayer(username);
    } else if (choice === "2") {
      return await handleAccountCreation(username);
    } else {
      console.log("Invalid choice.");
      return null;
    }
  } catch (err) {
    console.log(`Authentication error: ${err.message}`);
    return null;
  }
}

/**
 * player check method for simple username-based access
 * @param {string} username - Username to check or create
 * @returns {Promise<Player|null>} Player instance or null if failed
 */
export async function checkAndWelcomeGuestPlayer(username) {
  const guestPlayer = await playerService.getOrCreatePlayerGuestMode(username);
  if (guestPlayer.error) {
    console.log(`Error: ${guestPlayer.error}`);
    if (guestPlayer.details) {
      if (typeof guestPlayer.details === "object") {
        console.log(`Details: ${JSON.stringify(guestPlayer.details)}`);
      } else {
        console.log(`Details: ${guestPlayer.details}`);
      }
    }
    return null;
  }
  if (guestPlayer.lowestTime !== null) {
    console.log(
      `Hi ${guestPlayer.username}! Your previous lowest time was ${guestPlayer.lowestTime} seconds.\nPlaying as guest you have limited features.`
    );
  } else {
    console.log(
      `Hi ${guestPlayer.username}! Welcome to your first game!\nPlaying as guest you have limited features.`
    );
  }
  return new Player(
    guestPlayer.id,
    guestPlayer.username,
    guestPlayer.lowestTime,
    guestPlayer.role
  );
}

/**
 * Handles new user account creation with password confirmation
 * @param {string} username - Username for the new account
 * @returns {Promise<Player|null>} New Player instance or null if failed
 */
async function handleAccountCreation(username) {
  const password = readline.question("Enter a password: ", {
    hideEchoBack: true,
  });
  const confirmPassword = readline.question("Confirm password: ", {
    hideEchoBack: true,
  });

  if (password !== confirmPassword) {
    console.log("Passwords do not match.");
    return null;
  }

  const signupResult = await playerService.signup(username, password, "user");

  if (signupResult.error) {
    console.log(`Signup failed: ${signupResult.error}`);
    return null;
  }

  console.log(
    `Account created successfully! Welcome, ${signupResult.username}!`
  );
  console.log(`Role: user (full features)`);
  return new Player(
    signupResult.id,
    signupResult.username,
    signupResult.lowestTime,
    signupResult.role
  );
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
