import { useEffect, useRef, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PixelBackground } from "./PixelBackground";
import { Room } from "./Room";
import "./Landing.css";

export const Landing = () => {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [joined, setJoined] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    const getCam = async () => {
        try {
            const stream = await window.navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            const audioTrack = stream.getAudioTracks()[0]
            const videoTrack = stream.getVideoTracks()[0]
            setLocalAudioTrack(audioTrack);
            setlocalVideoTrack(videoTrack);
            if (!videoRef.current) {
                return;
            }
            videoRef.current.srcObject = new MediaStream([videoTrack])
            videoRef.current.play();
            setCameraReady(true);
        } catch (err) {
            console.error("Camera error:", err);
        }
    }

    useEffect(() => {
        if (videoRef && videoRef.current) {
            getCam()
        }
    }, [videoRef]);

    const canJoin = cameraReady;

    if (!joined) {
        return (
            <>
                <PixelBackground />
                <div className="crt-overlay" />

                <div className="landing-wrapper">
                    {/* Main Content */}
                    <div className="landing-content">
                        {/* Title / Branding */}
                        <div>
                            <h1 className="landing-title">
                                <span className="title-friend">Friend</span>
                                <span className="title-cirkle">Cirkle</span>
                            </h1>
                            <p className="landing-subtitle">
                                Welcome back, {user?.name || "Player"}
                            </p>
                        </div>

                        {/* Nav Buttons */}
                        <div className="feature-pills">
                            <button className="feature-pill" onClick={() => navigate("/profile")}>
                                <span className="pill-icon">[P]</span> PROFILE
                            </button>
                            <button className="feature-pill" onClick={() => navigate("/checkpoints")}>
                                <span className="pill-icon">[S]</span> SKILLS
                            </button>
                            <button className="feature-pill" onClick={() => navigate("/about")}>
                                <span className="pill-icon">[?]</span> ABOUT
                            </button>
                        </div>

                        {/* Camera Preview as CRT TV */}
                        <div className="crt-tv-frame">
                            <div className="crt-screen">
                                {!cameraReady && (
                                    <div className="camera-loading">
                                        <div className="loading-bars">
                                            <div className="loading-bar" />
                                            <div className="loading-bar" />
                                            <div className="loading-bar" />
                                            <div className="loading-bar" />
                                            <div className="loading-bar" />
                                        </div>
                                        <span className="camera-loading-text">LOADING CAM...</span>
                                    </div>
                                )}
                                <video
                                    autoPlay
                                    ref={videoRef}
                                    style={{ display: cameraReady ? 'block' : 'none' }}
                                />
                            </div>
                            <div className="tv-dots">
                                <div className={`tv-dot ${cameraReady ? 'active' : ''}`} />
                                <div className="tv-dot" />
                                <div className="tv-dot" />
                            </div>
                        </div>

                        {/* User Tags Preview */}
                        {user?.checkpoints && user.checkpoints.length > 0 && (
                            <div className="feature-pills">
                                {user.checkpoints.slice(0, 5).map(cp => (
                                    <div key={cp} className="feature-pill" style={{ cursor: "default", borderColor: "var(--neon-green)", color: "var(--neon-green)" }}>
                                        {cp}
                                    </div>
                                ))}
                                {user.checkpoints.length > 5 && (
                                    <div className="feature-pill" style={{ cursor: "default", borderColor: "var(--neon-yellow)", color: "var(--neon-yellow)" }}>
                                        +{user.checkpoints.length - 5} MORE
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Start Button */}
                        <div className="start-btn-wrapper">
                            <button
                                className="pixel-btn green"
                                disabled={!canJoin}
                                onClick={() => setJoined(true)}
                            >
                                FIND A MATCH
                            </button>
                            {!canJoin && (
                                <p className="press-start-text">
                                    WAITING FOR CAMERA...
                                </p>
                            )}
                            {canJoin && (
                                <p className="press-start-text" style={{ color: 'var(--neon-green)' }}>
                                    PRESS START TO FIND YOUR VIBE MATCH
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return <Room
        name={user?.name || "Player"}
        localAudioTrack={localAudioTrack}
        localVideoTrack={localVideoTrack}
        userCheckpoints={user?.checkpoints || []}
        userId={user?.id}
    />
}