import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

async function start(): Promise<void> {
    try {
        await connectDatabase();
        app.listen(PORT, () => {
            console.log(`World Pulse API running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

start();