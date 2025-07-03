import { Riddle } from "./Riddle.js";
import readline from 'readline-sync';

/**
 * Represents a multiple-choice riddle.
 * Extends the Riddle class to include answer choices.
 */
export class MultipleChoiceRiddle extends Riddle {
    /**
     * @param {string} name - The name/title of the riddle.
     * @param {string} taskDescription - The riddle's description/question.
     * @param {string|number} correctAnswer - The correct answer to the riddle.
     * @param {string} difficulty - The difficulty level of the riddle.
     * @param {number} timeLimit - The time limit for solving the riddle.
     * @param {string} hint - A hint for the riddle.
     * @param {string[]} choices - The list of answer choices.
     */
    constructor(name, taskDescription, correctAnswer, difficulty, timeLimit, hint, choices) {
        super(name, taskDescription, correctAnswer, difficulty, timeLimit, hint);
        this.choices = choices;
    }

    /**
     * Asks the multiple-choice riddle to the user and checks their answer.
     * @returns {boolean} Whether the hint was used.
     */
    askWithOptions() {
        this.printRiddleWithChoices();
        let flag = false;
        let usedHint = false;
        const correctIndex = this.findCorrectAnswerIndex();
        while (!flag) {
            const answer = readline.question('select your answer (1-4)! (type "hint" to get a hint!): ');
            if (answer.trim().toLowerCase() === "hint") {
                console.log(this.hint);
                console.log();
                usedHint = true;
            }
            else {
                let isCorrect = false;
                if (Number(answer) === correctIndex) {
                    isCorrect = true;
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
     * Prints the riddle's details and choices to the console.
     */
    printRiddleWithChoices() {
        console.log(`Riddle number: ${this.id}`);
        console.log(`Name: ${this.name}`);
        console.log(`Task description: ${this.taskDescription}`);
        console.log(`Time limit: ${this.timeLimit}\n`);
        this.choices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice}`);
        });
    }

    /**
     * Finds the index (1-based) of the correct answer in the choices array.
     * @returns {number} The index of the correct answer.
     */
    findCorrectAnswerIndex() {
        return this.choices.findIndex(choice => choice === this.correctAnswer) + 1;
    }
}