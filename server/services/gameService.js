import { create, read, update, remove } from "../DAL/crud.js";

const riddleDBPath = "C:\\JSProjects\\RiddleGame\\server\\DAL\\riddles\\riddleDb.txt";

export async function createRiddleService(riddle) {
    await create(riddle, riddleDBPath);
}

export async function readAllRiddlesService() {
    return await read(riddleDBPath);
}

export async function updateRiddleService(id, field, value) {
    await update(id, { [field]: value }, riddleDBPath);
}

export async function deleteRiddleService(id) {
    await remove(id, riddleDBPath);
}
