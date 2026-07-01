const mongoose = require('mongoose');
require('dotenv').config();


const clientOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1); 
    }
};

module.exports = connectDB;