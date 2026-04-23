import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGetFriends } from "../api";
import { PixelBackground } from "./PixelBackground";
import avatarMale from "../assets/avatar-male.png";
import avatarFemale from "../assets/avatar-female.png";
import "./Profile.css";

// Dummy friends that always appear
const DUMMY_FRIENDS = [
    { _id: "dummy-male", name: "PixelDude", college: "Pixel Academy", avatar: "male", isDummy: true },
    { _id: "dummy-female", name: "RetroGal", college: "Arcade University", avatar: "female", isDummy: true },
];

export const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFriends = async () => {
            try {
                const data = await apiGetFriends();
                setFriends(data);
            } catch {
                // API might fail if no DB
            } finally {
                setLoading(false);
            }
        };
        loadFriends();
    }, []);

    if (!user) {
        navigate("/login");
        return null;
    }

    const allFriends = [...friends, ...DUMMY_FRIENDS];

    return (
        <>
            <PixelBackground />
            <div className="crt-overlay" />
            <div className="profile-wrapper">
                <div className="profile-content">
                    <div className="profile-nav">
                        <button className="about-back-btn" onClick={() => navigate("/home")}>
                            -- HOME
                        </button>
                        <button className="about-back-btn" style={{ borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }} onClick={() => { logout(); navigate("/login"); }}>
                            LOGOUT
                        </button>
                    </div>

                    {/* Player Card */}
                    <div className="player-card">
                        <img
                            src={user.avatar === "female" ? avatarFemale : avatarMale}
                            alt="Your avatar"
                            className="player-avatar"
                        />
                        <h1 className="player-name">{user.name}</h1>
                        <p className="player-college">{user.college}</p>
                        <p className="player-email">{user.email}</p>

                        <div className="stat-row">
                            <div className="stat-item">
                                <span className="stat-value">{user.xp}</span>
                                <span className="stat-label">XP</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{user.friendCount + DUMMY_FRIENDS.length}</span>
                                <span className="stat-label">FRIENDS</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{user.checkpoints?.length || 0}</span>
                                <span className="stat-label">SKILLS</span>
                            </div>
                        </div>
                    </div>

                    {/* Checkpoints */}
                    <div className="profile-section">
                        <h2 className="profile-section-title">
                            YOUR SKILLS
                        </h2>
                        <div className="profile-tags">
                            {user.checkpoints?.length > 0 ? (
                                user.checkpoints.map(cp => (
                                    <span key={cp} className="profile-tag">{cp}</span>
                                ))
                            ) : (
                                <span className="profile-tag" style={{ borderColor: "var(--text-dim)", color: "var(--text-dim)" }}>
                                    No skills selected
                                </span>
                            )}
                        </div>
                        <button
                            className="pixel-btn cyan"
                            onClick={() => navigate("/checkpoints")}
                            style={{ marginTop: "16px", fontSize: "0.4rem", padding: "8px 16px" }}
                        >
                            EDIT SKILLS
                        </button>
                    </div>

                    {/* Friends */}
                    <div className="profile-section">
                        <h2 className="profile-section-title">
                            FRIEND LIST ({allFriends.length})
                        </h2>
                        <div className="friends-list">
                            {allFriends.map(friend => (
                                <div key={friend._id} className="friend-item">
                                    <img
                                        src={friend.avatar === "female" ? avatarFemale : avatarMale}
                                        alt={friend.name}
                                        className="friend-avatar"
                                    />
                                    <div className="friend-info">
                                        <div className="friend-name">{friend.name}</div>
                                        <div className="friend-college">{friend.college}</div>
                                    </div>
                                    {friend.isDummy && <span className="dummy-badge">BOT</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="pixel-btn green" onClick={() => navigate("/home")}>
                            BACK TO LOBBY
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
