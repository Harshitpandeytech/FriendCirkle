import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PixelBackground } from "./PixelBackground";
import "./Splash.css";

export const Splash = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const handleStart = () => {
        if (isLoggedIn) {
            navigate("/home");
        } else {
            navigate("/login");
        }
    };

    return (
        <>
            <PixelBackground />
            <div className="crt-overlay" />

            <div className="splash-wrapper">
                {/* Big Branding */}
                <div className="splash-title-block">
                    <h1 className="splash-title">
                        <span className="splash-friend">Friend</span>
                        <span className="splash-cirkle">Cirkle</span>
                    </h1>
                    <p className="splash-tagline">
                        CONNECT . CHAT . VIBE
                    </p>
                </div>

                {/* Pixel Divider */}
                <div className="splash-divider">
                    <div className="splash-divider-line" />
                    <div className="splash-divider-dot" />
                    <div className="splash-divider-dot" />
                    <div className="splash-divider-dot" />
                    <div className="splash-divider-dot" />
                    <div className="splash-divider-dot" />
                    <div className="splash-divider-line" />
                </div>

                {/* Start Button */}
                <div className="splash-start-area">
                    <button className="splash-start-btn" onClick={handleStart}>
                        PRESS START
                    </button>
                    <span className="splash-hint">
                        CLICK TO ENTER
                    </span>
                </div>

                {/* Version */}
                <span className="splash-version">
                    V 1.0 — COLLEGE EXCLUSIVE
                </span>
            </div>
        </>
    );
};
