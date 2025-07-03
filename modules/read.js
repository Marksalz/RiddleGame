
import { readFile, writeFile } from "node:fs/promises";
import { path } from "./create";


async function read() {
    //const path = 'C:\\JSProjects\\RiddleGame\\riddles\\db.txt';
    try {
        let dbArray;
        dbArray = JSON.parse(await readFile(path, 'utf8'));
        return dbArray;
    } catch (err) {
        console.error("Error reading riddles:", err.message);
    }
}

