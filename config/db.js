import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();


const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

export const connectDB = async () => {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        db = client.db("FOODHUB");
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export const getDB = () => db;