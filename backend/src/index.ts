import dotenv from "dotenv";
dotenv.config();

import { Socket } from "socket.io";
import http from "http";
import express from 'express';
import { Server } from 'socket.io';
import mongoose from "mongoose";
import cors from "cors";

import { UserManager } from "./managers/UserManger";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "FriendCirkle API is running 🕹️" });
});

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
    console.log('a user connected');

    // Listen for user joining with their info
    socket.on("join", ({ name, userId, checkpoints }: { name: string, userId?: string, checkpoints?: string[] }) => {
        userManager.addUser(name, socket, userId, checkpoints);
    });

    // Fallback: if no join event, add as anonymous
    // (keep backward compatibility)
    const joinTimeout = setTimeout(() => {
        const user = (userManager as any).users?.find?.((u: any) => u.socket.id === socket.id);
        if (!user) {
            userManager.addUser("Anonymous", socket);
        }
    }, 3000);

    socket.on("disconnect", () => {
        clearTimeout(joinTimeout);
        console.log("user disconnected");
        userManager.removeUser(socket.id);
    })
});

import { MongoMemoryServer } from 'mongodb-memory-server';

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/friendcirkle";

async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to local MongoDB");
    } catch (err: any) {
        console.error("❌ Local MongoDB connection failed:", err.message);
        console.log("⚠️ Starting In-Memory MongoDB Server...");
        try {
            const mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            await mongoose.connect(uri);
            console.log("✅ Connected to In-Memory MongoDB");
        } catch (memErr: any) {
            console.error("❌ Failed to start In-Memory MongoDB:", memErr.message);
        }
    }

    server.listen(PORT, () => {
        console.log(`🕹️  FriendCirkle server listening on *:${PORT}`);
    });
}

startServer();