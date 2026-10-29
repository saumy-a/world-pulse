import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
    const url = process.env.DATABASE_URL;

    if (!url) {
        throw new Error("DATABASE_URL is not set. Check your .env file.");
    }

    await mongoose.connect(url);
    console.log("MongoDB connected");
}