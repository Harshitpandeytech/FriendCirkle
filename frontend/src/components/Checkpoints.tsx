import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiUpdateCheckpoints } from "../api";
import { PixelBackground } from "./PixelBackground";
import "./Checkpoints.css";

const CHECKPOINT_OPTIONS = [
    { label: "Sports", icon: "S" },
    { label: "Photography", icon: "P" },
    { label: "Cinematography", icon: "C" },
    { label: "Drawing", icon: "D" },
    { label: "Sketching", icon: "K" },
    { label: "Coding", icon: "<>" },
    { label: "Consultancy", icon: "$$" },
    { label: "Interview Prep", icon: "IP" },
    { label: "Casual Talk", icon: "CT" },
    { label: "Politics", icon: "PL" },
    { label: "Music", icon: "MU" },
    { label: "Gaming", icon: "GM" },
    { label: "Anime & Manga", icon: "AN" },
    { label: "Startups", icon: "SU" },
    { label: "AI & ML", icon: "AI" },
    { label: "Design", icon: "DX" },
    { label: "Fitness", icon: "FT" },
    { label: "Travel", icon: "TR" },
    { label: "Memes", icon: "ME" },
    { label: "Philosophy", icon: "PH" },
];

export const Checkpoints = () => {
    const { user, updateUser } = useAuth();
    const [selected, setSelected] = useState<string[]>(user?.checkpoints || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const toggleTag = (label: string) => {
        setSelected(prev =>
            prev.includes(label)
                ? prev.filter(x => x !== label)
                : [...prev, label]
        );
    };

    const handleSave = async () => {
        if (selected.length < 2) {
            setError("Select at least 2 checkpoints!");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await apiUpdateCheckpoints(selected);
            updateUser({ checkpoints: selected });
            navigate("/home");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PixelBackground />
            <div className="crt-overlay" />
            <div className="checkpoints-wrapper">
                <div className="checkpoints-card">
                    <h1 className="checkpoints-title">SELECT YOUR SKILLS</h1>
                    <p className="checkpoints-subtitle">
                        CHOOSE YOUR INTERESTS — WE WILL MATCH YOU<br />
                        WITH PEOPLE WHO SHARE YOUR VIBE
                    </p>

                    {error && <div className="auth-error" style={{ marginBottom: "16px" }}>{error}</div>}

                    <div className="checkpoint-grid">
                        {CHECKPOINT_OPTIONS.map(opt => (
                            <button
                                key={opt.label}
                                className={`checkpoint-tag ${selected.includes(opt.label) ? "selected" : ""}`}
                                onClick={() => toggleTag(opt.label)}
                            >
                                <span className="tag-icon">{opt.icon}</span>
                                {opt.label.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <p className="checkpoint-count">
                        SELECTED: <strong>{selected.length}</strong> / {CHECKPOINT_OPTIONS.length}
                    </p>

                    <div className="checkpoints-actions">
                        <button
                            className="pixel-btn green"
                            onClick={handleSave}
                            disabled={loading || selected.length < 2}
                        >
                            {loading ? "SAVING..." : "LOCK IN AND GO"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
