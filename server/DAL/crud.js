import { readFile, writeFile } from "node:fs/promises";

export async function create(item, dbPath) {
    try {
        let dbArray = JSON.parse(await readFile(dbPath, 'utf8'));
        dbArray.push(item);
        await writeFile(dbPath, JSON.stringify(dbArray, null, 2), "utf8");
    } catch (err) {
        throw new Error("Error creating item: " + err.message);
    }
}

export async function read(dbPath) {
    try {
        let dbArray = JSON.parse(await readFile(dbPath, 'utf8'));
        return dbArray;
    } catch (err) {
        throw new Error("Error reading items: " + err.message);
    }
}

export async function update(id, newData, dbPath) {
    try {
        let dbArray = JSON.parse(await readFile(dbPath, 'utf8'));
        const index = dbArray.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error("Id not found!");
        }
        const updatedItem = dbArray[index];
        for (let key in newData) {
            if (key !== "id") {
                updatedItem[key] = newData[key];
            }
        }
        dbArray[index] = updatedItem;
        await writeFile(dbPath, JSON.stringify(dbArray, null, 2), "utf8");
    } catch (err) {
        throw new Error("Error updating item: " + err.message);
    }
}

export async function remove(id, dbPath) {
    try {
        let dbArray = JSON.parse(await readFile(dbPath, 'utf8'));
        const index = dbArray.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error("Id not found!");
        }
        dbArray.splice(index, 1);
        await writeFile(dbPath, JSON.stringify(dbArray, null, 2), "utf8");
    } catch (err) {
        throw new Error("Error deleting item: " + err.message);
    }
}