/**
 * @fileoverview Player class representing a game participant with role-based permissions.
 * Manages player statistics, timing records, and access control for game features.
 * @author RiddleGame Team
 */

/**
 * Represents a player in the riddle game with role-based access control
 * @class
 * @example
 * const player = new Player(1, 'john_doe', 45.5, 'user');
 * console.log(`${player.username} can create riddles: ${player.canCreateRiddles()}`);
 */
export class Player {
    /**
     * Creates a new Player instance
     * @param {number} id - The player's unique database ID
     * @param {string} username - The player's username
     * @param {number|null} [lowestTime=null] - The player's best completion time in seconds
     * @param {string} [role='guest'] - The player's role (guest, user, admin)
     */
    constructor(id, username, lowestTime = null, role = 'guest') {
        this.id = id;
        this.username = username;
        this.lowestTime = lowestTime;
        this.role = role;
    }

    /**
     * Records a completion time and updates the player's best time if improved
     * @param {number} finalTime - The completion time including penalties in seconds
     * @returns {number} The player's current best time (may be unchanged)
     * @description
     * Only updates lowestTime if the new time is better (lower) than the current best.
     * Used to track player improvement over time.
     * @example
     * const newBest = player.recordTime(42.3);
     * console.log(`New best time: ${newBest}s`);
     */
    recordTime(finalTime) {
        if (this.lowestTime === null || finalTime < this.lowestTime) {
            this.lowestTime = finalTime;
        }
        return this.lowestTime;
    }

    /**
     * Checks if the player can create new riddles
     * @returns {boolean} True if player has riddle creation privileges
     * @description User and admin roles can create riddles, guests cannot
     */
    canCreateRiddles() {
        return this.role === 'user' || this.role === 'admin';
    }

    /**
     * Checks if the player can edit existing riddles
     * @returns {boolean} True if player has riddle editing privileges
     * @description Only admin role can edit riddles
     */
    canEditRiddles() {
        return this.role === 'admin';
    }

    /**
     * Checks if the player can delete riddles
     * @returns {boolean} True if player has riddle deletion privileges
     * @description Only admin role can delete riddles
     */
    canDeleteRiddles() {
        return this.role === 'admin';
    }

    /**
     * Checks if the player can view all riddles in the system
     * @returns {boolean} True if player has full riddle viewing privileges
     * @description User and admin roles can view all riddles, guests have limited access
     */
    canViewAllRiddles() {
        return this.role === 'user' || this.role === 'admin';
    }
}