import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';
import { create, read, update, remove } from '../modules/crud.js';
import readline from 'readline-sync';

const riddleDBPath = "C:\\JSProjects\\RiddleGame\\DAL\\riddles\\riddleDb.txt";


// Create a new riddle
export async function createRiddle() {
    try {
        const name = readline.question('Enter riddle name: ');
        const taskDescription = readline.question('Enter riddle description: ');
        const correctAnswer = readline.question('Enter correct answer: ');
        const difficulty = readline.question('Enter difficulty (easy/medium/hard): ');
        const timeLimit = Number(readline.question('Enter time limit (seconds): '));
        const hint = readline.question('Enter a hint: ');
        let riddle = undefined;
        if (readline.keyInYN('Is this a multiple choice riddle?')) {
            let choices = [];
            for (let i = 1; i <= 4; i++) {
                choices.push(readline.question(`Enter choice ${i}: `));
            }
            riddle = new MultipleChoiceRiddle(name, taskDescription, correctAnswer, difficulty, timeLimit, hint, choices);
        }
        else {
            riddle = new Riddle(name, taskDescription, correctAnswer, difficulty, timeLimit, hint);
        }
        await create(riddle, riddleDBPath);
    } catch (err) {
        console.log("Failed to create riddle:", err.message);
    }
}

// Read all riddles
export async function readAllRiddles() {
    try {
        const riddles = await read(riddleDBPath);
        riddles.forEach(riddle => {
            console.log(`ID: ${riddle.id}, Name: ${riddle.name}, Difficulty: ${riddle.difficulty}`);
            console.log(`Description: ${riddle.taskDescription}`);
            if (riddle.choices) {
                console.log('Choices:', riddle.choices.join(', '));
            }
            console.log(`Answer: ${riddle.correctAnswer}, Hint: ${riddle.hint}, Time Limit: ${riddle.timeLimit}`);
            console.log('---');
        });
    } catch (err) {
        console.log("Failed to read riddles:", err.message);
    }
}

// Update an existing riddle
export async function updateRiddle() {
    try {
        const id = Number(readline.question('Enter the ID of the riddle to update: '));
        const field = readline.question('Which field do you want to update? (name, taskDescription, correctAnswer, difficulty, timeLimit, hint, choices):');
        let value;
        if (field === 'choices') {
            value = [];
            for (let i = 1; i <= 4; i++) {
                value.push(readline.question(`Enter choice ${i}: `));
            }
        } else if (field === 'timeLimit') {
            value = Number(readline.question('Enter new time limit (seconds): '));
        } else {
            value = readline.question(`Enter new value for ${field}: `);
        }
        await update(id, { [field]: value }, riddleDBPath);
    } catch (err) {
        console.log("Failed to update riddle:", err.message);
    }
}

// Delete a riddle
export async function delete_r() {
    try {
        const id = Number(readline.question('Enter the ID of the riddle to delete: '));
        await remove(id, riddleDBPath);
    } catch (err) {
        console.log("Failed to delete riddle:", err.message);
    }
}

// View leaderboard (simple placeholder)
export function viewLeaderboard() {
    // You can implement a real leaderboard based on player stats if you store them
    console.log("Leaderboard feature is not implemented yet.");
}


/**
//  * Loads riddles of a specific difficulty level.
//  * @param {string|number} level - The difficulty level to filter riddles by.
//  * @returns {Array<Riddle|MultipleChoiceRiddle>} Array of riddle instances matching the level.
//  */
// export function loadRiddles(level) {
//     let riddles = [];
//     allRiddles.forEach(riddle => {
//         if ('choices' in riddle) {
//             riddles.push(new MultipleChoiceRiddle(riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
//                 riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.choices));
//         }
//         else {
//             riddles.push(new Riddle(riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
//                 riddle.difficulty, riddle.timeLimit, riddle.hint));
//         }
//     });
//     const filterdRiddles = riddles.filter(riddle => riddle.difficulty === level);
//     return filterdRiddles;
// }

// /**
//  * Returns a function that asks the riddle to the player and records the time taken, including penalties.
//  * @param {Riddle|MultipleChoiceRiddle} riddle - The riddle to ask.
//  * @param {Object} player - The player object with a recordTime method.
//  * @returns {Function} Function that, when called, asks the riddle and records time.
//  */
// export function timedAsk(riddle, player) {
//     let usedHint = false;
//     return function () {
//         const start = Date.now();
//         if (riddle instanceof MultipleChoiceRiddle) {
//             usedHint = riddle.askWithOptions();
//         }
//         else {
//             usedHint = riddle.ask();
//         }
//         const end = Date.now();
//         player.recordTime(start, end, calculatePenaltyTime(riddle, start, end, usedHint));
//     }
// }

// /**
//  * Calculates penalty time based on time taken and hint usage.
//  * @param {Riddle|MultipleChoiceRiddle} riddle - The riddle being answered.
//  * @param {number} start - Start timestamp (ms).
//  * @param {number} end - End timestamp (ms).
//  * @param {boolean} usedHint - Whether a hint was used.
//  * @returns {number} The penalty time in seconds.
//  */
// export function calculatePenaltyTime(riddle, start, end, usedHint) {
//     const actualTime = (end - start) / 1000;
//     let penaltyTime = 0;
//     if (actualTime > riddle.timeLimit) {
//         penaltyTime += 5;
//         console.log("Too slow! 5 seconds penalty applied.\n");
//     }
//     if (usedHint) {
//         penaltyTime += 10;
//         console.log("Penalty! 10 seconds added to recorded time!\n");
//     }
//     return penaltyTime;
// }
