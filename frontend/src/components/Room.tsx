import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { apiAddFriend, apiReport } from "../api";
import "./Room.css";

const URL = "http://localhost:3000";

const EMOJI_LIST = [
    "😀","😂","😍","🤩","😎","🥳","🤪","😜",
    "👋","✌️","🤟","👍","👏","🙌","🤝","💪",
    "❤️","🔥","⭐","✨","💫","🎮","🕹️","🎯",
    "🎉","🎊","💬","🗨️","💡","🚀","⚡","🌟",
    "😈","👻","💀","👾","🤖","👽","🎃","🦄",
];

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    isSelf: boolean;
    isSystem?: boolean;
    timestamp: number;
}

interface MatchInfo {
    peerName: string;
    peerId?: string;
    sharedCheckpoints: string[];
    matchPercentage: number;
}

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack,
    userCheckpoints,
    userId,
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
    userCheckpoints?: string[],
    userId?: string,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>();
    const localVideoRef = useRef<HTMLVideoElement>();

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Match & In-call state
    const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
    const [friendAdded, setFriendAdded] = useState(false);
    const [reported, setReported] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const socket = io(URL);

        socket.emit("join", {
            name,
            userId,
            checkpoints: userCheckpoints || [],
        });

        socket.on('send-offer', async ({roomId, matchInfo: mi}) => {
            console.log("sending offer");
            setLobby(false);
            setCurrentRoomId(roomId);
            if (mi) setMatchInfo(mi);

            addSystemMessage("Connected! Say hi");
            if (mi?.sharedCheckpoints?.length > 0) {
                addSystemMessage(`Vibe Match: ${mi.matchPercentage}% — You both like: ${mi.sharedCheckpoints.join(", ")}`);
            }

            const pc = new RTCPeerConnection();
            setSendingPc(pc);
            if (localVideoTrack) {
                pc.addTrack(localVideoTrack)
            }
            if (localAudioTrack) {
                pc.addTrack(localAudioTrack)
            }

            pc.onicecandidate = async (e) => {
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   })
                }
            }

            pc.onnegotiationneeded = async () => {
                const sdp = await pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }
        });

        socket.on("offer", async ({roomId, sdp: remoteSdp}) => {
            setLobby(false);
            setCurrentRoomId(roomId);
            addSystemMessage("Connected! Say hi");

            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp)
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            setReceivingPc(pc);
            // @ts-ignore
            window.pcr = pc;
            pc.ontrack = () => {};

            pc.onicecandidate = async (e) => {
                if (!e.candidate) return;
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   })
                }
            }

            socket.emit("answer", { roomId, sdp: sdp });

            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();
            }, 5000)
        });

        socket.on("answer", ({roomId, sdp: remoteSdp}) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate, type}) => {
            if (type == "sender") {
                setReceivingPc(pc => {
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }
        })

        socket.on("chat-message", ({ sender, text }: { sender: string, text: string }) => {
            const msg: ChatMessage = {
                id: `${Date.now()}-${Math.random()}`,
                sender,
                text,
                isSelf: false,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, msg]);
        });

        setSocket(socket)

        return () => {
            socket.disconnect();
        };
    }, [name])

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])

    const addSystemMessage = (text: string) => {
        setMessages(prev => [...prev, {
            id: `sys-${Date.now()}-${Math.random()}`,
            sender: "SYSTEM",
            text,
            isSelf: false,
            isSystem: true,
            timestamp: Date.now(),
        }]);
    };

    const sendMessage = () => {
        const text = chatInput.trim();
        if (!text || !socket || !currentRoomId) return;

        const msg: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            sender: name || "PLAYER 1",
            text,
            isSelf: true,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, msg]);

        socket.emit("chat-message", {
            roomId: currentRoomId,
            sender: name || "PLAYER 1",
            text,
        });

        setChatInput("");
        setShowEmoji(false);
    };

    const handleEmojiClick = (emoji: string) => {
        setChatInput(prev => prev + emoji);
    };

    const handleSkip = () => {
        if (socket) {
            socket.disconnect();
        }
        window.location.reload();
    };

    const handleAddFriend = async () => {
        if (!matchInfo?.peerId || friendAdded) return;
        try {
            await apiAddFriend(matchInfo.peerId);
            setFriendAdded(true);
            addSystemMessage("Friend request sent! +10 XP");
        } catch (err: any) {
            addSystemMessage(`Error: ${err.message}`);
        }
    };

    const handleReport = async (reason: string) => {
        if (!matchInfo?.peerId || reported) return;
        try {
            await apiReport(matchInfo.peerId, reason);
            setReported(true);
            setShowReportModal(false);
            addSystemMessage("User reported. Thank you for keeping the community safe.");
        } catch (err: any) {
            addSystemMessage(`Error: ${err.message}`);
        }
    };

    return (
        <div className="room-wrapper">
            <div className="crt-overlay" />

            {/* Report Modal */}
            {showReportModal && (
                <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="report-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="report-modal-title">REPORT USER</h3>
                        <p className="report-modal-text">SELECT A REASON:</p>
                        <div className="report-options">
                            {["Inappropriate behavior", "Harassment", "Spam", "Other"].map(reason => (
                                <button
                                    key={reason}
                                    className="report-option-btn"
                                    onClick={() => handleReport(reason)}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                        <button className="report-cancel-btn" onClick={() => setShowReportModal(false)}>
                            CANCEL
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="room-header">
                <div className="room-logo">
                    <span className="logo-icon">[*]</span>
                    <span className="logo-friend">Friend</span>
                    <span className="logo-cirkle">Cirkle</span>
                </div>

                {matchInfo && !lobby && (
                    <div className="match-info-badge">
                        <span className="match-percent">{matchInfo.matchPercentage}%</span>
                        <span className="match-label">VIBE</span>
                    </div>
                )}

                <div className="room-status">
                    {lobby ? (
                        <div className="status-badge waiting">
                            <span className="status-dot yellow" />
                            MATCHING...
                        </div>
                    ) : (
                        <div className="status-badge connected">
                            <span className="status-dot green" />
                            CONNECTED
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="room-body">
                <div className="video-section">
                    <div className="video-grid">
                        {/* Local Video */}
                        <div className="video-card self">
                            <div className="video-card-label">
                                <span className="player-badge">[P1]</span>
                                PLAYER 1 — {name}
                            </div>
                            <div className="video-display">
                                {/* @ts-ignore */}
                                <video autoPlay ref={localVideoRef} />
                            </div>
                        </div>

                        {/* Remote Video */}
                        <div className="video-card remote">
                            <div className="video-card-label">
                                <span className="player-badge">[P2]</span>
                                {matchInfo?.peerName ? `PLAYER 2 — ${matchInfo.peerName}` : "PLAYER 2"}
                            </div>
                            <div className="video-display">
                                {lobby ? (
                                    <div className="waiting-overlay">
                                        <div className="waiting-pixel-art">?</div>
                                        <div className="waiting-text">
                                            WAITING FOR<br />PLAYER 2...
                                        </div>
                                        <div className="waiting-spinner">
                                            <div className="waiting-spinner-dot" />
                                            <div className="waiting-spinner-dot" />
                                            <div className="waiting-spinner-dot" />
                                        </div>
                                    </div>
                                ) : (
                                    // @ts-ignore
                                    <video autoPlay ref={remoteVideoRef} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* In-Call Controls */}
                    {!lobby && (
                        <div className="call-controls">
                            <button
                                className="control-btn skip"
                                onClick={handleSkip}
                                title="Skip to next person"
                            >
                                <span className="control-icon">[&gt;&gt;]</span>
                                <span className="control-label">SKIP</span>
                            </button>
                            <button
                                className={`control-btn friend ${friendAdded ? 'done' : ''}`}
                                onClick={handleAddFriend}
                                disabled={friendAdded || !matchInfo?.peerId}
                                title="Add as friend"
                            >
                                <span className="control-icon">{friendAdded ? '[OK]' : '[+]'}</span>
                                <span className="control-label">{friendAdded ? 'ADDED' : 'ADD FRIEND'}</span>
                            </button>
                            <button
                                className={`control-btn report ${reported ? 'done' : ''}`}
                                onClick={() => setShowReportModal(true)}
                                disabled={reported}
                                title="Report user"
                            >
                                <span className="control-icon">{reported ? '[OK]' : '[!]'}</span>
                                <span className="control-label">{reported ? 'REPORTED' : 'FLAG'}</span>
                            </button>
                        </div>
                    )}

                    {/* Shared Checkpoints */}
                    {matchInfo?.sharedCheckpoints && matchInfo.sharedCheckpoints.length > 0 && !lobby && (
                        <div className="shared-tags">
                            <span className="shared-tags-label">SHARED VIBES:</span>
                            {matchInfo.sharedCheckpoints.map(cp => (
                                <span key={cp} className="shared-tag">{cp}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                <div className="chat-panel">
                    <div className="chat-header">
                        <span className="chat-header-icon">[MSG]</span>
                        CHAT
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="chat-empty">
                                <div className="chat-empty-icon">...</div>
                                <div className="chat-empty-text">
                                    NO MESSAGES YET<br />
                                    SAY SOMETHING
                                </div>
                            </div>
                        ) : (
                            messages.map(msg =>
                                msg.isSystem ? (
                                    <div key={msg.id} className="chat-msg-system">
                                        &gt; {msg.text}
                                    </div>
                                ) : (
                                    <div key={msg.id} className={`chat-msg ${msg.isSelf ? 'self' : 'other'}`}>
                                        <span className="chat-msg-sender">
                                            {msg.isSelf ? `${msg.sender} (YOU)` : msg.sender}
                                        </span>
                                        <div className="chat-msg-bubble">
                                            {msg.text}
                                        </div>
                                    </div>
                                )
                            )
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="chat-input-area">
                        {showEmoji && (
                            <div className="emoji-picker">
                                {EMOJI_LIST.map((emoji, i) => (
                                    <button key={i} className="emoji-btn" onClick={() => handleEmojiClick(emoji)}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="emoji-row">
                            <button
                                className={`emoji-toggle-btn ${showEmoji ? 'active' : ''}`}
                                onClick={() => setShowEmoji(prev => !prev)}
                            >
                                {showEmoji ? '[-]' : '[+]'}
                            </button>
                        </div>

                        <div className="chat-input-row">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder={lobby ? "Waiting for connection..." : "Type a message..."}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') sendMessage();
                                }}
                                disabled={lobby}
                            />
                            <button
                                className="chat-send-btn"
                                onClick={sendMessage}
                                disabled={lobby || !chatInput.trim()}
                            >
                                SEND
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
