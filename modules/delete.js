
import { readFile, writeFile } from "node:fs/promises";
import { path } from "./create.js";


export async function deleteRiddle(id) {
    try {
        let dbArray = JSON.parse(await readFile(path, 'utf8'));
        const index = dbArray.findIndex(riddle => riddle.id === id);
        if (index === -1) {
            throw new Error("Id not found!");
        }
        else {
            dbArray.splice(index, 1);
        }
        try {
            await writeFile(path, JSON.stringify(dbArray, null, 2), "utf8");
            console.log("Riddle deleted successfully!");
        } catch (err) {
            console.log("Error writing to file", err.message);
        }
    } catch (err) {
        console.error("Error reading riddles:", err.message);
    }
}