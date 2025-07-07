import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';
import { create, read, update, remove } from '../modules/crud.js';
import { updatePlayerLowestTime } from './playerManager.js';
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

export async function loadRiddlesByLevel(level) {
    const allRiddles = await read(riddleDBPath);
    const riddles = allRiddles.map(riddle => {
        if ('choices' in riddle) {
            return new MultipleChoiceRiddle(
                riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.choices
            );
        } else {
            return new Riddle(
                riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint
            );
        }
    });
    console.log(allRiddles);
    console.log();
    console.log(riddles);
    return riddles.filter(riddle =>
        riddle.difficulty &&
        riddle.difficulty.toLowerCase().trim() === level.toLowerCase().trim()
    );
}

export async function timedAsk(riddle, player) {
    let usedHint = false;
    const start = Date.now();
    if (riddle instanceof MultipleChoiceRiddle) {
        usedHint = riddle.askWithOptions();
    }
    else {
        usedHint = riddle.ask();
    }
    const end = Date.now();
    const time = player.recordTime(start, end, calculatePenaltyTime(riddle, start, end, usedHint));
    await updatePlayerLowestTime(player.id, time);
}

export function calculatePenaltyTime(riddle, start, end, usedHint) {
    const actualTime = (end - start) / 1000;
    let penaltyTime = 0;
    if (actualTime > riddle.timeLimit) {
        penaltyTime += 5;
        console.log("Too slow! 5 seconds penalty applied.\n");
    }
    if (usedHint) {
        penaltyTime += 10;
        console.log("Penalty! 10 seconds added to recorded time!\n");
    }
    return penaltyTime;
}
