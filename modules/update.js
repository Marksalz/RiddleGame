import { Riddle } from "../classes/Riddle.js"
import { readFile, writeFile } from "node:fs/promises";
import { path } from "./create.js";


export async function update(id, newData) {
    try {
        let dbArray = JSON.parse(await readFile(path, 'utf8'));
        const index = dbArray.findIndex(riddle => riddle.id === id);
        if (index === -1) {
            throw new Error("Id not found!");
        }
        const updatedRiddle = dbArray[index];
        for (let key in newData) {
            if (key !== "Id") {
                updatedRiddle[key] = newData[key];
            }
        }
        dbArray[index] = updatedRiddle;
        try {
            await writeFile(path, JSON.stringify(dbArray, null, 2), "utf8");
            console.log("Riddle updated successfully!");
        } catch (err) {
            console.log("Error writing to file", err.message);
        }
    } catch (err) {
        console.error("Error reading riddles:", err.message);
    }
}