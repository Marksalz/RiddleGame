import client from "../lib/riddles/riddleDb.js";
import "dotenv/config";
import { ObjectId } from "mongodb";

const riddleCollection = client.collection("riddles");

export async function createRiddle(riddle) {
    const result = await riddleCollection.insertOne(riddle);
    console.log(`Inserted document with _id: ${result.insertedId}`);
    return result;
}

export async function getRiddles() {
    const allRiddles = await riddleCollection.find().toArray();
    console.log(allRiddles);
    return allRiddles;
}

export async function updateRiddle(id, newData) {
    const updateResult = await riddleCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: newData }
    );
    console.log(`${updateResult.modifiedCount} document(s) updated`);
    return updateResult;
}

export async function deleteRiddle(id) {
    const deleteResult = await riddleCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`${deleteResult.deletedCount} document(s) deleted`);
    return deleteResult;
}