 import { User } from "./UserManger";

let GLOBAL_ROOM_ID = 1;

interface Room {
    user1: User,
    user2: User,
    sharedCheckpoints: string[],
    matchPercentage: number,
}

export class RoomManager {
    private rooms: Map<string, Room>
    constructor() {
        this.rooms = new Map<string, Room>()
    }

    createRoom(user1: User, user2: User, sharedCheckpoints: string[] = [], matchPercentage: number = 0) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(), {
            user1, 
            user2,
            sharedCheckpoints,
            matchPercentage,
        })

        // Send match info along with room assignment
        user1.socket.emit("send-offer", {
            roomId,
            matchInfo: {
                peerName: user2.name,
                peerId: user2.odUserId,
                sharedCheckpoints,
                matchPercentage,
            }
        })

        user2.socket.emit("send-offer", {
            roomId,
            matchInfo: {
                peerName: user1.name,
                peerId: user1.odUserId,
                sharedCheckpoints,
                matchPercentage,
            }
        })
    }

    onOffer(roomId: string, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
        receivingUser?.socket.emit("offer", {
            sdp,
            roomId
        })
    }
    
    onAnswer(roomId: string, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;

        receivingUser?.socket.emit("answer", {
            sdp,
            roomId
        });
    }

    onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({candidate, type}));
    }

    onChatMessage(roomId: string, senderSocketid: string, sender: string, text: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("chat-message", { sender, text });
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }

}