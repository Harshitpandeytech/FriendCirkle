import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiLogin, apiRegister } from "../api";
import { PixelBackground } from "./PixelBackground";
import avatarMale from "../assets/avatar-male.png";
import avatarFemale from "../assets/avatar-female.png";
import "./Auth.css";

export const Auth = () => {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState<"male" | "female">("male");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "register") {
                if (!name.trim()) { setError("Player name is required!"); setLoading(false); return; }
                const data = await apiRegister(email, password, name, avatar);
                login(data.token, data.user);
                navigate("/checkpoints");
            } else {
                const data = await apiLogin(email, password);
                login(data.token, data.user);
                if (!data.user.checkpoints || data.user.checkpoints.length === 0) {
                    navigate("/checkpoints");
                } else {
                    navigate("/home");
                }
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PixelBackground />
            <div className="crt-overlay" />
            <div className="auth-wrapper">
                <div className="auth-card">
                    <h1 className="auth-title">
                        <span className="title-friend">Friend</span>
                        <span className="title-cirkle">Cirkle</span>
                    </h1>
                    <p className="auth-subtitle">COLLEGE EXCLUSIVE ACCESS</p>

                    {/* Tabs */}
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${mode === "login" ? "active" : ""}`}
                            onClick={() => { setMode("login"); setError(""); }}
                        >
                            LOGIN
                        </button>
                        <button
                            className={`auth-tab ${mode === "register" ? "active" : ""}`}
                            onClick={() => { setMode("register"); setError(""); }}
                        >
                            REGISTER
                        </button>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === "register" && (
                            <div className="auth-field">
                                <label className="auth-label">{'>'} PLAYER NAME</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="Your display name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    maxLength={20}
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label className="auth-label">{'>'} COLLEGE EMAIL</label>
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="you@college.ac.in"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">{'>'} PASSWORD</label>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {mode === "register" && (
                            <div className="auth-field">
                                <label className="auth-label">{'>'} CHOOSE AVATAR</label>
                                <div className="avatar-picker">
                                    <button
                                        type="button"
                                        className={`avatar-option ${avatar === "male" ? "selected" : ""}`}
                                        onClick={() => setAvatar("male")}
                                    >
                                        <img src={avatarMale} alt="Male Avatar" />
                                        <span>DUDE</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`avatar-option ${avatar === "female" ? "selected" : ""}`}
                                        onClick={() => setAvatar("female")}
                                    >
                                        <img src={avatarFemale} alt="Female Avatar" />
                                        <span>DUDETTE</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="pixel-btn green"
                            disabled={loading}
                            style={{ width: "100%", marginTop: "8px" }}
                        >
                            {loading ? "LOADING..." : mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
