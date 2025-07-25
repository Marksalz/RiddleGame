import * as crud from "../DAL/riddleCrud.js"

export async function createRiddle(riddle) {
    try {
        validateRiddle(riddle);
        await crud.createRiddle(riddle);
    } catch (err) {
        throw new Error("Could not create riddle: " + err.message);
    }
}

export async function readAllRiddles(difficulty) {
    try {
        let riddles = null;
        if (difficulty) {
            riddles = await crud.getRiddlesByDifficulty(difficulty);
        }
        else {
            riddles = await crud.getRiddles();
        }
        return riddles;
    } catch (err) {
        throw new Error("Could not read riddles: " + err.message);
    }
}

export async function updateRiddle(id, field, value) {
    try {
        await crud.updateRiddle(id, { [field]: value });
    } catch (err) {
        throw new Error("Could not update riddle: " + err.message);
    }
}

export async function deleteRiddle(id) {
    try {
        await crud.deleteRiddle(id);
    } catch (err) {
        throw new Error("Could not delete riddle: " + err.message);
    }
}

function validateRiddle(riddle) {
    if (!riddle.name || !riddle.taskDescription || !riddle.correctAnswer || !riddle.difficulty || !riddle.timeLimit || !riddle.hint) {
        throw new Error("Missing required riddle fields.");
    }
    if (typeof riddle.timeLimit !== "number" || riddle.timeLimit <= 0) {
        throw new Error("Invalid time limit.");
    }
    if (!["easy", "medium", "hard"].includes(riddle.difficulty.toLowerCase().trim())) {
        throw new Error("Invalid difficulty.");
    }
    if (riddle.choices && (!Array.isArray(riddle.choices) || riddle.choices.length < 2)) {
        throw new Error("Multiple choice riddles must have at least 2 choices.");
    }
}

export const riddleCtrl = {
    createRiddle,
    readAllRiddles,
    updateRiddle,
    deleteRiddle
};


