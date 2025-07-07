/**
 * Represents a player in the riddle game.
 */
export class Player {
    /**
     * @param {string} name - The player's name.
     */
    constructor(name) {
        this.name = name;
        this.lowestTime = null;
    }

    /**
     * Records the time taken to solve a riddle, including any penalty.
     * @param {number} start - The start time (timestamp in ms).
     * @param {number} end - The end time (timestamp in ms).
     * @param {number} penaltyTime - The penalty time in seconds.
     */
    recordTime(start, end, penaltyTime) {
        const time = ((end - start) / 1000) + penaltyTime;
        if (this.lowestTime === null || time < this.lowestTime) {
            this.lowestTime = time;
        }
        return this.time;
    }

    /**
     * Displays the player's total and average time statistics.
     */
    showStats() {
        let sum = 0;
        this.times.forEach(time => { sum += time });
        let avg = sum / this.times.length;

        console.log(`Total time: ${sum.toFixed(2)} seconds`);
        console.log(`Average time per riddle: ${avg.toFixed(2)} seconds\n`);
    }
}
