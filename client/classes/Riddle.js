import fs from 'fs';
import readline from 'readline-sync';
import { read } from '../../server/DAL/crud.js';

const riddleDBPath = "C:\\JSProjects\\RiddleGame\\server\\DAL\\riddles\\riddleDb.txt";

/**
 * Represents a riddle with a question, answer, and related metadata.
 */
export class Riddle {

    static nextId = 0;

    /**
     * Initializes the nextId based on the highest ID in the db file.
     * Call this ONCE before creating any riddles.
     */
    static async initializeNextIdFromDb() {
        try {
            const riddles = await read(riddleDBPath);
            const maxId = riddles.reduce((max, r) => Math.max(max, r.id), 0);
            Riddle.nextId = maxId + 1;
        } catch (err) {
            // If file doesn't exist or is empty, keep nextId as 1
            Riddle.nextId = 1;
        }
    }

    /**
     * @param {string} name - The name/title of the riddle.
     * @param {string} taskDescription - The riddle's description/question.
     * @param {string|number} correctAnswer - The correct answer to the riddle.
     * @param {string} difficulty - The difficulty level of the riddle.
     * @param {number} timeLimit - The time limit for solving the riddle.
     * @param {string} hint - A hint for the riddle.
     * @param {number} [id] - (Optional) The riddle's ID. If not provided, auto-assign.
     */
    constructor(name, taskDescription, correctAnswer, difficulty, timeLimit, hint, id) {
        if (id !== undefined && id !== null) {
            this.id = id;
        } else {
            this.id = Riddle.nextId++;
        }
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