import readline from 'readline-sync';
import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';
import * as riddleService from '../services/riddleService.js';
import * as playerManager from './playerManager.js'
import * as playerService from '../services/playerService.js';
import riddleDb from '../../server/lib/riddles/riddleDb.js';

function promptUntilValid(promptText, validateFn, errorMsg) {
    let value;
    while (true) {
        value = readline.question(promptText);
        if (validateFn(value)) break;
        if (errorMsg) console.log(errorMsg);
    }
    return value;
}

export async function handlePlayGame(player) {
    const level = promptUntilValid(
        'Choose difficulty: easy / medium / hard: ',
        v => ["easy", "medium", "hard"].includes(v.toLowerCase().trim()),
        "Invalid difficulty. Please enter easy, medium, or hard."
    );
    console.log();
    let riddles = await loadUnsolvedRiddlesByLevel(player.id, level);
    if (riddles.length === 0) {
        console.log("No unsolved riddles left for this difficulty!");
        return;
    }
    for (const riddle of riddles) {
        let times = timedAsk(riddle, player);
        await playerManager.updatePlayerLowestTime(player.id, times.updatedTime);
        await playerService.recordSolvedRiddle(player.id, riddle.id, times.finalTime);
    }
}

export async function handleCreateRiddle() {
    const riddleName = promptUntilValid(
        'Enter riddle name: ',
        v => v && v.trim().length > 0,
        "Riddle name cannot be empty."
    );
    const taskDescription = promptUntilValid(
        'Enter riddle description: ',
        v => v && v.trim().length > 0,
        "Description cannot be empty."
    );
    const correctAnswer = promptUntilValid(
        'Enter correct answer: ',
        v => v && v.trim().length > 0,
        "Answer cannot be empty."
    );
    const difficulty = promptUntilValid(
        'Enter difficulty (easy/medium/hard): ',
        v => ["easy", "medium", "hard"].includes(v.toLowerCase().trim()),
        "Invalid difficulty. Please enter easy, medium, or hard."
    );
    const timeLimit = Number(promptUntilValid(
        'Enter time limit (seconds): ',
        v => !isNaN(Number(v)) && Number(v) > 0,
        "Time limit must be a positive number."
    ));
    const hint = promptUntilValid(
        'Enter a hint: ',
        v => v && v.trim().length > 0,
        "Hint cannot be empty."
    );
    let riddleData = { name: riddleName, taskDescription, correctAnswer, difficulty, timeLimit, hint };
    if (readline.keyInYN('Is this a multiple choice riddle?')) {
        let choices = [];
        for (let i = 1; i <= 4; i++) {
            const choiceText = promptUntilValid(
                `Enter choice ${i}: `,
                v => v && v.trim().length > 0,
                "Choice cannot be empty."
            );
            choices.push(choiceText);
        }
        riddleData.choices = choices;
    }
    const result = await riddleService.createRiddle(riddleData);
    if (result.error) {
        console.log("Failed to create riddle: " + result.error);
        if (result.details) console.log("Details: " + result.details);
    } else {
        console.log("Riddle created successfully!");
    }
}

export async function handleReadAllRiddles() {
    const riddles = await riddleService.readAllRiddles();
    if (riddles.error) {
        console.log("Failed to read riddles: " + riddles.error);
        if (riddles.details) console.log("Details: " + riddles.details);
        return;
    }
    riddles.forEach((riddle, idx) => {
        console.log(`Riddle #${idx + 1}`);
        console.log(`Name: ${riddle.name}, Difficulty: ${riddle.difficulty}`);
        console.log(`Description: ${riddle.taskDescription}`);
        if (riddle.choices) {
            console.log('Choices:', riddle.choices.join(', '));
        }
        console.log(`Answer: ${riddle.correctAnswer}, Hint: ${riddle.hint}, Time Limit: ${riddle.timeLimit}`);
        console.log('---');
    });
}

export async function handleUpdateRiddle() {
    try {
        const id = readline.question('Enter the ID of the riddle to update: ');
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
        const result = await riddleService.updateRiddle(id, field, value);
        if (result.error) {
            console.log("Failed to update riddle: " + result.error);
            if (result.details) console.log("Details: " + result.details);
        } else {
            console.log("Riddle updated successfully!");
        }
    } catch (err) {
        console.log("Failed to update riddle: " + err.message);
    }
}

export async function handleDeleteRiddle() {
    try {
        const id = readline.question('Enter the ID of the riddle to delete: ');
        const result = await riddleService.deleteRiddle(id);
        if (result.error) {
            console.log("Failed to delete riddle: " + result.error);
            if (result.details) console.log("Details: " + result.details);
        } else {
            console.log("Riddle deleted successfully!");
        }
    } catch (err) {
        console.log("Failed to delete riddle: " + err.message);
    }
}

export async function loadUnsolvedRiddlesByLevel(player_id, level) {
    const allRiddles = await playerService.getUnsolvedRiddles(player_id, level);
    //console.log(allRiddles);

    if (allRiddles.error) {
        console.log(`Error loading riddles: ${allRiddles.error}`);
        if (allRiddles.details) console.log(`Details: ${allRiddles.details}`);
        return [];
    }
    const riddlesInClass = allRiddles.map(riddle => {
        if ('choices' in riddle) {
            return new MultipleChoiceRiddle(
                riddle._id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.choices
            );
        } else {
            return new Riddle(
                riddle._id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint
            );
        }
    });

    return riddlesInClass;
}

export function timedAsk(riddle, player) {
    let usedHint = false;
    const start = Date.now();
    if (riddle instanceof MultipleChoiceRiddle) {
        usedHint = riddle.askWithOptions();
    }
    else {
        usedHint = riddle.ask();
    }
    const end = Date.now();
    const finalTime = ((end - start) / 1000) + calculatePenaltyTime(riddle, start, end, usedHint);
    const updatedTime = player.recordTime(finalTime);
    //await playerManager.updatePlayerLowestTime(player.id, time);
    return { finalTime, updatedTime };
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