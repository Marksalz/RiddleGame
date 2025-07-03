import { readFile, writeFile } from "node:fs/promises";

export const path = 'C:\\JSProjects\\RiddleGame\\riddles\\db.txt';

export async function create(riddle) {
    try {
        let dbArray;
        dbArray = JSON.parse(await readFile(path, 'utf8'));
        dbArray.push(riddle);
        try {
            await writeFile(path, JSON.stringify(dbArray, null, 2), "utf8");
            console.log("Riddle added successfully!");
        } catch (err) {
            throw new Error("Error writing to file", err.message);
        }
    } catch (err) {
        throw new Error("Error creating riddle: ", err.message);
    }
}