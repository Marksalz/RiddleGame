import { Riddle } from "../classes/Riddle.js";
import { readFile, writeFile } from "node:fs/promises";

export async function create(riddle) {
    const path = 'C:\\JSProjects\\RiddleGame\\riddles\\db.txt';
    try {
        let dbArray;
        dbArray = JSON.parse(await readFile(path, 'utf8'));
        dbArray.push(riddle);
        await writeFile(path, JSON.stringify(dbArray, null, 2), "utf8");
    } catch (err) {
        console.error("Error creating riddle:", err);
    }
}

const myRiddle = new Riddle(
    8,
    "The Sphinx's Riddle",
    "What walks on four legs in the morning, two legs at noon, and three legs in the evening?",
    "man",
    "medium",
    60,
    "Think about the stages of a human's life."
);
await create(myRiddle);