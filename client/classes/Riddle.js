/**
 * @fileoverview Base Riddle class for text-based riddles with user interaction.
 * Handles riddle presentation, answer validation, and hint functionality.
 * @author RiddleGame Team
 */

import readline from 'readline-sync';

/**
 * Represents a text-based riddle with answer validation and hint system
 * @class
 * @example
 * const riddle = new Riddle(
 *   '507f1f77bcf86cd799439011',
 *   'Math Puzzle',
 *   'What is 2 + 2?',
 *   '4',
 *   'easy',
 *   30,
 *   'Think basic arithmetic'
 * );
 * const usedHint = riddle.ask(); // Presents riddle to user
 */
export class Riddle {
    /**
     * Creates a new Riddle instance
     * @param {string} id - MongoDB ObjectId of the riddle
     * @param {string} name - Display name/title of the riddle
     * @param {string} taskDescription - The riddle question or task
     * @param {string|number} correctAnswer - The correct answer
     * @param {string} difficulty - Difficulty level (easy, medium, hard)
     * @param {number} timeLimit - Time limit in seconds
     * @param {string} hint - Hint text to help solve the riddle
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
     * Presents the riddle to the user and handles answer validation
     * @returns {boolean} True if the user requested a hint, false otherwise
     * @description
     * Interactive flow:
     * 1. Displays riddle information
     * 2. Prompts for answer or hint request
     * 3. Validates answer with type-appropriate comparison
     * 4. Continues until correct answer is provided
     * 5. Tracks hint usage for penalty calculation
     * @example
     * const riddle = new Riddle(...);
     * const usedHint = riddle.ask();
     * if (usedHint) console.log('Hint penalty will be applied');
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
                // Handle both numeric and string answers with appropriate comparison
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
     * Displays the riddle's information to the console
     * @description Formats and prints riddle details including name, task, and time limit
     */
    printRiddle() {
        console.log(`Riddle: `);
        console.log(`Name: ${this.name}`);
        console.log(`Task description: ${this.taskDescription}`);
        console.log(`Time limit: ${this.timeLimit}\n`);
    }
}