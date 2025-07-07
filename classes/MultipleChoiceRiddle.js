import { Riddle } from "./Riddle.js";
import readline from 'readline-sync';

/**
 * Represents a multiple-choice riddle.
 * Extends the Riddle class to include answer choices.
 */
export class MultipleChoiceRiddle extends Riddle {
    /**
     * @param {string} name
     * @param {string} taskDescription
     * @param {string|number} correctAnswer
     * @param {string} difficulty
     * @param {number} timeLimit
     * @param {string} hint
     * @param {string[]} choices
     * @param {number} [id]
     */
    constructor(name, taskDescription, correctAnswer, difficulty, timeLimit, hint, choices, id) {
        super(name, taskDescription, correctAnswer, difficulty, timeLimit, hint, id);
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