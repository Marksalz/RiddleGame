
import { readFile, writeFile } from "node:fs/promises";
import { path } from "./create";


async function read() {
    try {
        let dbArray;
        dbArray = JSON.parse(await readFile(path, 'utf8'));
        return dbArray;
    } catch (err) {
        throw new Error("Error reading riddles: ", err.message);
    }
}

