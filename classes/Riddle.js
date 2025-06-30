import readline from 'readline-sync';

/**
 * Represents a riddle with a question, answer, and related metadata.
 */
export class Riddle {
    /**
     * @param {number} id - The riddle's unique identifier.
     * @param {string} name - The name/title of the riddle.
     * @param {string} taskDescription - The riddle's description/question.
     * @param {string|number} correctAnswer - The correct answer to the riddle.
     * @param {string} difficulty - The difficulty level of the riddle.
     * @param {number} timeLimit - The time limit for solving the riddle.
     * @param {string} hint - A hint for the riddle.
     */
    constructor(id, name, taskDescription, correctAnswer, difficulty, timeLimit, hint) {
        this.id = id;
        this.name = name;
        this.taskDescription = taskDescription;
        this.correctAnswer = correctAnswer;
        this.difficulty = difficulty;
        this.timeLimit = timeLimit;
        this.hint = hint;
    }

    /**
     * Asks the riddle to the user and checks their answer.
     * @returns {boolean} Whether the hint was used.
     */
    ask() {
        this.printRiddle();
        let flag = false;
        let usedHint = false;
        while (!flag) {
            const answer = readline.question('What is your answer? (type "hint" to get a hint!): ');
            if (answer.trim().toLowerCase() === "hint") {
                console.log(this.hint);
                console.log();
                usedHint = true;
            }
            else {
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
        return usedHint;
    }

    /**
     * Prints the riddle's details to the console.
     */
    printRiddle() {
        console.log(`Riddle number: ${this.id}`);
        console.log(`Name: ${this.name}`);
        console.log(`Task description: ${this.taskDescription}`);
        console.log(`Time limit: ${this.timeLimit}\n`);
    }
}