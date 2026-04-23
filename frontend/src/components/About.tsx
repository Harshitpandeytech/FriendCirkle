import { useNavigate } from "react-router-dom";
import { PixelBackground } from "./PixelBackground";
import "./About.css";

export const About = () => {
    const navigate = useNavigate();

    return (
        <>
            <PixelBackground />
            <div className="crt-overlay" />
            <div className="about-wrapper">
                <div className="about-content">
                    <div className="about-nav">
                        <button className="about-back-btn" onClick={() => navigate(-1)}>
                            -- BACK
                        </button>
                    </div>

                    {/* Hero */}
                    <div className="about-hero">
                        <h1 className="about-hero-title">
                            <span className="title-friend">Friend</span>
                            <span className="title-cirkle">Cirkle</span>
                        </h1>
                        <p className="about-hero-sub">
                            THE COLLEGE-EXCLUSIVE SOCIAL ARCADE
                        </p>
                    </div>

                    {/* What is this */}
                    <div className="about-section">
                        <h2 className="about-section-title">
                            <span className="section-icon">[?]</span> WHAT IS FRIENDCIRKLE
                        </h2>
                        <p className="about-text">
                            FriendCirkle is a real-time video + text chat platform designed exclusively for
                            Indian college students. We are NOT another random video chat app. We are a safe,
                            verified, interest-based matching platform wrapped in a retro arcade experience.
                        </p>
                        <p className="about-text">
                            Only verified college email IDs can enter. You choose your interests, and our
                            algorithm matches you with people who share your vibe — not just random strangers.
                        </p>
                    </div>

                    {/* How we are different */}
                    <div className="about-section">
                        <h2 className="about-section-title">
                            <span className="section-icon">[VS]</span> HOW WE ARE DIFFERENT
                        </h2>
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>FEATURE</th>
                                    <th>OMEGLE</th>
                                    <th>FRIENDCIRKLE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>College Verified</td>
                                    <td className="no">X</td>
                                    <td className="yes">YES</td>
                                </tr>
                                <tr>
                                    <td>Interest Matching</td>
                                    <td className="no">X</td>
                                    <td className="yes">YES</td>
                                </tr>
                                <tr>
                                    <td>XP and Karma</td>
                                    <td className="no">X</td>
                                    <td className="yes">YES</td>
                                </tr>
                                <tr>
                                    <td>Friend System</td>
                                    <td className="no">X</td>
                                    <td className="yes">YES</td>
                                </tr>
                                <tr>
                                    <td>Group Calls</td>
                                    <td className="no">X</td>
                                    <td className="yes">YES</td>
                                </tr>
                                <tr>
                                    <td>Report and Safety</td>
                                    <td className="no">WEAK</td>
                                    <td className="yes">STRONG</td>
                                </tr>
                                <tr>
                                    <td>Retro 8-Bit UI</td>
                                    <td className="no">X</td>
                                    <td className="yes">YES</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Features */}
                    <div className="about-section">
                        <h2 className="about-section-title">
                            <span className="section-icon">[+]</span> FEATURES
                        </h2>
                        <ul className="about-features">
                            <li className="about-feature-item">
                                <span className="feature-icon">[VID]</span> Real-time WebRTC video chat
                            </li>
                            <li className="about-feature-item">
                                <span className="feature-icon">[MSG]</span> Instant messaging with emoji support
                            </li>
                            <li className="about-feature-item">
                                <span className="feature-icon">[ALG]</span> Interest-based smart matching algorithm
                            </li>
                            <li className="about-feature-item">
                                <span className="feature-icon">[GRP]</span> Group calls with 2-5 people
                            </li>
                            <li className="about-feature-item">
                                <span className="feature-icon">[ADD]</span> Add friends and build your network
                            </li>
                            <li className="about-feature-item">
                                <span className="feature-icon">[XP]</span> XP and Karma system for good vibes
                            </li>
                            <li className="about-feature-item">
                                <span className="feature-icon">[RPT]</span> Report and flag system to keep it safe
                            </li>
                            <li className="about-feature-item">
                                <span className="feature-icon">[VRF]</span> College-verified access only
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};
