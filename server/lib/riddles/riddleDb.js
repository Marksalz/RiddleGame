import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to DB");
    } catch (error) {
        console.log(error);
    }
}
export default client.db('riddle_game');