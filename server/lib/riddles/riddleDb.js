import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

/**
 * Establishes connection to MongoDB database
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 */
export async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to DB");
    } catch (error) {
        console.log(error);
    }
}

/**
 * MongoDB database instance for the riddle game
 * @type {import('mongodb').Db}
 */
export default client.db('riddle_game');