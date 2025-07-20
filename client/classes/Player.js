/**
 * Represents a player in the riddle game.
 */
export class Player {
    /**
     * @param {string} name - The player's name.
     */
    constructor(id, name, lowestTime = null) {
        this.id = id;
        this.name = name;
        this.lowestTime = lowestTime;
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
}