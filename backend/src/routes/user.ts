import { Router, Response } from "express";
import { UserModel, ALL_CHECKPOINTS } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /api/user/profile
router.get("/profile", async (req: AuthRequest, res: Response) => {
    try {
        const user = await UserModel.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        return res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            college: user.college,
            avatar: user.avatar,
            checkpoints: user.checkpoints,
            friends: user.friends,
            friendCount: user.friendCount,
            xp: user.xp,
            createdAt: user.createdAt,
        });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/user/checkpoints — update user's interest tags
router.put("/checkpoints", async (req: AuthRequest, res: Response) => {
    try {
        const { checkpoints } = req.body;
        if (!Array.isArray(checkpoints)) {
            return res.status(400).json({ error: "Checkpoints must be an array" });
        }

        // Validate all tags
        const valid = checkpoints.every((cp: string) => ALL_CHECKPOINTS.includes(cp));
        if (!valid) {
            return res.status(400).json({ error: "Invalid checkpoint tags" });
        }

        const user = await UserModel.findByIdAndUpdate(
            req.userId,
            { checkpoints },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ error: "User not found" });

        return res.json({
            checkpoints: user.checkpoints,
            message: "Checkpoints updated!",
        });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

// POST /api/user/add-friend
router.post("/add-friend", async (req: AuthRequest, res: Response) => {
    try {
        const { friendId } = req.body;
        if (!friendId) return res.status(400).json({ error: "friendId required" });

        if (friendId === req.userId) {
            return res.status(400).json({ error: "Cannot add yourself" });
        }

        const user = await UserModel.findById(req.userId);
        const friend = await UserModel.findById(friendId);

        if (!user || !friend) return res.status(404).json({ error: "User not found" });

        if (user.friends.includes(friendId)) {
            return res.status(409).json({ error: "Already friends" });
        }

        // Add each other as friends
        user.friends.push(friendId);
        user.friendCount = user.friends.length;
        friend.friends.push(req.userId!);
        friend.friendCount = friend.friends.length;

        // Both gain XP for making a friend
        user.xp += 10;
        friend.xp += 10;

        await user.save();
        await friend.save();

        return res.json({
            message: "Friend added!",
            friendCount: user.friendCount,
            xp: user.xp,
        });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

// POST /api/user/report
router.post("/report", async (req: AuthRequest, res: Response) => {
    try {
        const { reportedUserId, reason } = req.body;
        if (!reportedUserId) return res.status(400).json({ error: "reportedUserId required" });

        const reportedUser = await UserModel.findById(reportedUserId);
        if (!reportedUser) return res.status(404).json({ error: "User not found" });

        reportedUser.reportCount += 1;
        reportedUser.xp = Math.max(0, reportedUser.xp - 5);

        // Auto-ban after 5 reports
        if (reportedUser.reportCount >= 5) {
            reportedUser.isBanned = true;
        }

        await reportedUser.save();

        return res.json({ message: "User reported. Thank you for keeping the community safe." });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

// GET /api/user/friends — get friend list with details
router.get("/friends", async (req: AuthRequest, res: Response) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const friends = await UserModel.find({ _id: { $in: user.friends } })
            .select("name college avatar xp checkpoints");

        return res.json({ friends });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

export default router;
