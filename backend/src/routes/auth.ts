import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, ALLOWED_DOMAINS, COLLEGE_NAMES, ALL_CHECKPOINTS } from "../models/User";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { email, password, name, avatar } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" });
        }

        // Validate college email domain
        const domain = email.split("@")[1]?.toLowerCase();
        if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
            return res.status(403).json({
                error: "ACCESS DENIED! Only approved college email IDs are allowed.",
                allowedDomains: ALLOWED_DOMAINS,
            });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: "User with this email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Get college name from domain
        const college = COLLEGE_NAMES[domain] || domain;

        // Create user
        const user = new UserModel({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            college,
            avatar: avatar || "male",
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                college: user.college,
                avatar: user.avatar,
                checkpoints: user.checkpoints,
                friendCount: user.friendCount,
                xp: user.xp,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Validate domain
        const domain = email.split("@")[1]?.toLowerCase();
        if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
            return res.status(403).json({
                error: "ACCESS DENIED! Only approved college email IDs are allowed.",
            });
        }

        // Find user
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check ban
        if (user.isBanned) {
            return res.status(403).json({ error: "Your account has been suspended due to reports." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        return res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                college: user.college,
                avatar: user.avatar,
                checkpoints: user.checkpoints,
                friendCount: user.friendCount,
                xp: user.xp,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// GET /api/auth/checkpoints — list all available checkpoints
router.get("/checkpoints", (_req: Request, res: Response) => {
    return res.json({ checkpoints: ALL_CHECKPOINTS });
});

// GET /api/auth/domains — list all allowed college domains
router.get("/domains", (_req: Request, res: Response) => {
    return res.json({
        domains: ALLOWED_DOMAINS,
        colleges: COLLEGE_NAMES,
    });
});

export default router;
