
export class Player {
    constructor(name) {
        this.name = name;
        this.times = [];
    }

    recordTime(start, end, penaltyTime) {
        const time = ((end - start) / 1000) + penaltyTime;
        this.times.push(time);
    }

    showStats() {
        let sum = 0;
        this.times.forEach(time => { sum += time });
        let avg = sum / this.times.length;

        console.log(`Total time: ${sum.toFixed(2)} seconds`);
        console.log(`Average time per riddle: ${avg.toFixed(2)} seconds\n`);
    }
}
