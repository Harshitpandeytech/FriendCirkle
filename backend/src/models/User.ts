import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    college: string;
    avatar: "male" | "female";
    checkpoints: string[];
    friends: string[]; // array of user IDs
    friendCount: number;
    xp: number;
    reportCount: number;
    isBanned: boolean;
    createdAt: Date;
}

// Allowed college domains
export const ALLOWED_DOMAINS = [
    "hbtu.ac.in",
    "igdtuw.ac.in",
    "iitd.ac.in",
    "dtu.ac.in",
    "nsut.ac.in",
    "nitt.edu",
    "amity.edu",
    "galgotiasuniversity.edu.in",
    "cumail.in",
    "iiita.ac.in",
];

// Mapping domain to college name
export const COLLEGE_NAMES: Record<string, string> = {
    "hbtu.ac.in": "HBTU Kanpur",
    "igdtuw.ac.in": "IGDTUW Delhi",
    "iitd.ac.in": "IIT Delhi",
    "dtu.ac.in": "DTU Delhi",
    "nsut.ac.in": "NSUT Delhi",
    "nitt.edu": "NIT Trichy",
    "amity.edu": "Amity University",
    "galgotiasuniversity.edu.in": "Galgotias University",
    "cumail.in": "Chandigarh University",
    "iiita.ac.in": "IIIT Allahabad",
};

// All available checkpoint tags
export const ALL_CHECKPOINTS = [
    "Sports",
    "Photography",
    "Cinematography",
    "Drawing",
    "Sketching",
    "Coding",
    "Consultancy",
    "Interview Prep",
    "Casual Talk",
    "Politics",
    "Music",
    "Gaming",
    "Anime & Manga",
    "Startups",
    "AI & ML",
    "Design",
    "Fitness",
    "Travel",
    "Memes",
    "Philosophy",
];

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true, maxlength: 20 },
    college: { type: String, required: true },
    avatar: { type: String, enum: ["male", "female"], default: "male" },
    checkpoints: { type: [String], default: [] },
    friends: { type: [String], default: [] },
    friendCount: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
