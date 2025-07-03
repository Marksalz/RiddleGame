
import { readFile, writeFile } from "node:fs/promises";
import { path } from "./create";


export function delete_s(id) {
    const filePath = 'C:\\JSProjects\\SchoolManagerCRUD\\DB\\DB.txt';
    return readFilePromise(filePath)
        .then((data) => {
            let arrayData = JSON.parse(data);
            const index = arrayData.findIndex(student => student.Id === id);
            if (index !== -1) {
                arrayData.splice(index, 1);
            }
            else {
                throw new Error("Id not found!")
            }
            return writeFilePromise(filePath, JSON.stringify(arrayData, null, 2));
        })
        .catch(err => {
            throw new Error("Error deleting student: " + err.message);
        });
}