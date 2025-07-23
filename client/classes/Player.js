/**
 * Represents a player in the riddle game.
 */
export class Player {
    /**
     * @param {number} id - The player's ID.
     * @param {string} username - The player's username.
     * @param {number|null} lowestTime - The player's lowest time.
     * @param {string} role - The player's role.
     */
    constructor(id, username, lowestTime = null, role = 'guest') {
        this.id = id;
        this.username = username;
        this.lowestTime = lowestTime;
        this.role = role;
    }

    /**
     * Records the time taken to solve a riddle, including any penalty.
     * @param {number} start - The start time (timestamp in ms).
     * @param {number} end - The end time (timestamp in ms).
     * @param {number} penaltyTime - The penalty time in seconds.
     */
    recordTime(finalTime) {
        //const time = ((end - start) / 1000) + penaltyTime;
        if (this.lowestTime === null || finalTime < this.lowestTime) {
            this.lowestTime = finalTime;
        }
        return this.lowestTime;
    }

    canCreateRiddles() {
        return this.role === 'user' || this.role === 'admin';
    }

    canEditRiddles() {
        return this.role === 'admin';
    }

    canDeleteRiddles() {
        return this.role === 'admin';
    }

    canViewAllRiddles() {
        return this.role === 'user' || this.role === 'admin';
    }
}