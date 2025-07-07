import { Riddle } from '../classes/Riddle.js';
import { Player } from '../classes/Player.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';
import { createRiddleService, readAllRiddlesService, updateRiddleService, deleteRiddleService } from '../../server/services/gameService.js';
import { updatePlayerLowestTime } from '../playerManager.js';
import readline from 'readline-sync';

// Create a new riddle
export async function createRiddle(riddleData) {
    try {
        let riddle;
        if (riddleData.choices && Array.isArray(riddleData.choices)) {
            riddle = new MultipleChoiceRiddle(
                riddleData.name,
                riddleData.taskDescription,
                riddleData.correctAnswer,
                riddleData.difficulty,
                riddleData.timeLimit,
                riddleData.hint,
                riddleData.choices
            );
        } else {
            riddle = new Riddle(
                riddleData.name,
                riddleData.taskDescription,
                riddleData.correctAnswer,
                riddleData.difficulty,
                riddleData.timeLimit,
                riddleData.hint
            );
        }
        await createRiddleService(riddle);
    } catch (err) {
        throw new Error("Failed to create riddle: " + err.message);
    }
}

// Read all riddles
export async function readAllRiddles() {
    try {
        const riddles = await readAllRiddlesService();
        return riddles;
    } catch (err) {
        throw new Error("Failed to read riddles: " + err.message);
    }
}

// Update an existing riddle
export async function updateRiddle(id, field, value) {
    try {
        await updateRiddleService(id, field, value);
    } catch (err) {
        throw new Error("Failed to update riddle: " + err.message);
    }
}

// Delete a riddle
export async function deleteRiddle(id) {
    try {
        await deleteRiddleService(id);
    } catch (err) {
        throw new Error("Failed to delete riddle: " + err.message);
    }
}

export async function loadRiddlesByLevel(level) {
    const allRiddles = await readAllRiddlesService();
    const riddles = allRiddles.map(riddle => {
        if ('choices' in riddle) {
            return new MultipleChoiceRiddle(
                riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.choices, riddle.id
            );
        } else {
            return new Riddle(
                riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.id
            );
        }
    });
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