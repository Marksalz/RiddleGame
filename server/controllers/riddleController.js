import * as crud from "../DAL/crud.js"

const riddleDBPath = "C:\\JSProjects\\RiddleGame\\server\\DAL\\riddles\\riddleDb.txt";

export async function createRiddle(riddle) {
    try {
        const riddles = await crud.read(riddleDBPath);
        const newId = getNextRiddleId(riddles);
        validateRiddle(riddle);
        const riddleWithId = { id: newId, ...riddle };
        await crud.create(riddleWithId, riddleDBPath);
    } catch (err) {
        throw new Error("Could not create riddle: " + err.message);
    }
}

export async function readAllRiddles() {
    try {
        return await crud.read(riddleDBPath);
    } catch (err) {
        throw new Error("Could not read riddles: " + err.message);
    }
}

export async function updateRiddle(id, field, value) {
    try {
        await crud.update(id, { [field]: value }, riddleDBPath);
    } catch (err) {
        throw new Error("Could not update riddle: " + err.message);
    }
}

export async function deleteRiddle(id) {
    try {
        await crud.remove(id, riddleDBPath);
    } catch (err) {
        throw new Error("Could not delete riddle: " + err.message);
    }
}

function getNextRiddleId(riddles) {
    return riddles.length > 0 ? Math.max(...riddles.map(r => r.id)) + 1 : 1;
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

