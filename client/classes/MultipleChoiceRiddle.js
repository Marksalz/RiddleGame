/**
 * @fileoverview Multiple choice riddle class extending base Riddle functionality.
 * Handles riddles with predefined answer choices and numeric selection validation.
 * Provides enhanced user interaction with numbered options.
 * @author RiddleGame Team
 */

import { Riddle } from "./Riddle.js";
import readline from 'readline-sync';

/**
 * Represents a multiple-choice riddle with numbered options
 * @class
 * @extends Riddle
 */
export class MultipleChoiceRiddle extends Riddle {
    /**
     * Creates a new MultipleChoiceRiddle instance
     * @param {string} id - MongoDB ObjectId of the riddle
     * @param {string} name - Display name/title of the riddle
     * @param {string} taskDescription - The riddle question
     * @param {string} correctAnswer - The correct answer text (must match one of the choices)
     * @param {string} difficulty - Difficulty level (easy, medium, hard)
     * @param {number} timeLimit - Time limit in seconds
     * @param {string} hint - Hint text to help solve the riddle
     * @param {Array<string>} choices - Array of answer choices (typically 4 options)
     */
    constructor(id, name, taskDescription, correctAnswer, difficulty, timeLimit, hint, choices) {
        super(id, name, taskDescription, correctAnswer, difficulty, timeLimit, hint);
        this.choices = choices;
    }

    /**
     * Presents the multiple-choice riddle and handles user selection
     * @returns {boolean} True if the user requested a hint, false otherwise
     * @description
     * Interactive flow:
     * 1. Displays riddle with numbered choices (1-4)
     * 2. Prompts for numeric selection or hint request
     * 3. Validates selection against correct answer index
     * 4. Continues until correct selection is made
     * 5. Tracks hint usage for penalty calculation
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
                // Validate numeric selection against correct answer index
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
     * Displays the riddle's details with numbered choice options
     * @description Formats and prints riddle information including all answer choices
     * numbered from 1-4 for easy user selection
     */
    printRiddleWithChoices() {
        console.log(`Riddle:`);
        console.log(`Name: ${this.name}`);
        console.log(`Task description: ${this.taskDescription}`);
        console.log(`Time limit: ${this.timeLimit}\n`);

        // Display numbered choices for user selection
        this.choices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice}`);
        });
    }

    /**
     * Finds the 1-based index of the correct answer in the choices array
     * @returns {number} The 1-based index of the correct answer (1-4)
     * @description
     * Searches through the choices array to find which option matches
     * the correctAnswer text, then returns the 1-based index for user selection
     */
    findCorrectAnswerIndex() {
        return this.choices.findIndex(choice => choice === this.correctAnswer) + 1;
    }
}