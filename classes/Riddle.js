import readline from 'readline-sync';

export class Riddle {
    constructor(id, name, taskDescription, correctAnswer) {
        this.id = id;
        this.name = name;
        this.taskDescription = taskDescription;
        this.correctAnswer = correctAnswer;
    }

    ask() {
        this.printRiddle();
        let flag = false;
        while (!flag) {
            const answer = readline.question('What is your answer? ');
            let isCorrect = false;
            if (typeof this.correctAnswer === 'number') {
                isCorrect = Number(answer.trim()) === this.correctAnswer;
            } else {
                isCorrect = answer.trim().toLowerCase() === String(this.correctAnswer).trim().toLowerCase();
            }
            if (isCorrect) {
                console.log("Correct!!\n");
                flag = true;
            } else {
                console.log("Wrong answer, try again!\n");
            }
        }
    }

    printRiddle() {
        console.log(`Riddle number: ${this.id}`);
        console.log(`Name: ${this.name}`);
        console.log(`Task description: ${this.taskDescription}\n`);
    }
}