/**
 * @fileoverview Data Access Layer for riddle operations.
 * Provides CRUD operations for riddles using MongoDB.
 * @author RiddleGame Team
 */

import client from "../lib/riddles/riddleDb.js";
import "dotenv/config";
import { ObjectId } from "mongodb";

const riddleCollection = client.collection("riddles");

/**
 * Creates a new riddle document in MongoDB
 * @param {Object} riddle - Riddle object to insert
 * @returns {Object} MongoDB insert result with insertedId
 * @throws {Error} If database operation fails
 */
export async function createRiddle(riddle) {
    const result = await riddleCollection.insertOne(riddle);
    console.log(`Inserted document with _id: ${result.insertedId}`);
    return result;
}

/**
 * Retrieves all riddles from the database
 * @returns {Array} Array of all riddle documents
 * @throws {Error} If database operation fails
 */
export async function getRiddles() {
    const allRiddles = await riddleCollection.find().toArray();
    console.log(allRiddles);
    return allRiddles;
}

/**
 * Retrieves riddles filtered by difficulty level
 * @param {string} difficulty - Difficulty level to filter by (easy, medium, hard)
 * @returns {Array} Array of riddles matching the difficulty
 * @throws {Error} If database operation fails
 */
export async function getRiddlesByDifficulty(difficulty) {
    const riddles = await riddleCollection.find({ difficulty }).toArray();
    console.log(riddles);
    return riddles;
}

/**
 * Updates a riddle document with new data
 * @param {string} id - MongoDB ObjectId string
 * @param {Object} newData - Object containing fields to update
 * @returns {Object} MongoDB update result with modifiedCount
 * @throws {Error} If database operation fails or invalid ObjectId
 */
export async function updateRiddle(id, newData) {
    const updateResult = await riddleCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: newData }
    );
    console.log(`${updateResult.modifiedCount} document(s) updated`);
    return updateResult;
}

/**
 * Deletes a riddle document from the database
 * @param {string} id - MongoDB ObjectId string
 * @returns {Object} MongoDB delete result with deletedCount
 * @throws {Error} If database operation fails or invalid ObjectId
 */
export async function deleteRiddle(id) {
    const deleteResult = await riddleCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`${deleteResult.deletedCount} document(s) deleted`);
    return deleteResult;
}