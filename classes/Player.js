
class Player {
    constructor(name) {
        this.name = name;
        this.times = [];
    }

    recordTime(start, end) {
        const time = (end - start) / 1000;
        this.times.push(time);
    }

    showStats() {
        let sum = 0;
        this.times.forEach(time => { sum += time });
        let avg = sum / this.times.length;

        console.log(`Total time: ${sum} seconds`);
        console.log(`Average time per riddle: ${avg} seconds\n`);
    }
}
