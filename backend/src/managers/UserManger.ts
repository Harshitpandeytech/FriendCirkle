import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface User {
    socket: Socket;
    name: string;
    odUserId?: string;      // MongoDB user ID
    checkpoints?: string[]; // Interest tags
}

export class UserManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;
    
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: Socket, userId?: string, checkpoints?: string[]) {
        this.users.push({
            name, socket, odUserId: userId, checkpoints: checkpoints || []
        })
        this.queue.push(socket.id);
        socket.emit("lobby");
        this.clearQueue()
        this.initHandlers(socket);
    }

    removeUser(socketId: string) {
        const user = this.users.find(x => x.socket.id === socketId);
        
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x !== socketId);
    }

    // Calculate match score based on shared checkpoints
    private getMatchScore(user1: User, user2: User): number {
        if (!user1.checkpoints?.length || !user2.checkpoints?.length) {
            return 0;
        }
        const shared = user1.checkpoints.filter(cp => user2.checkpoints!.includes(cp));
        return shared.length;
    }

    // Get shared checkpoints between two users
    private getSharedCheckpoints(user1: User, user2: User): string[] {
        if (!user1.checkpoints?.length || !user2.checkpoints?.length) {
            return [];
        }
        return user1.checkpoints.filter(cp => user2.checkpoints!.includes(cp));
    }

    clearQueue() {
        console.log("inside clear queues")
        console.log(this.queue.length);
        if (this.queue.length < 2) {
            return;
        }

        // Try to find the best match based on checkpoints
        let bestPairIdx1 = -1;
        let bestPairIdx2 = -1;
        let bestScore = -1;

        const queueUsers = this.queue.map(id => ({
            id,
            user: this.users.find(x => x.socket.id === id)
        })).filter(x => x.user);

        if (queueUsers.length < 2) return;

        // Find best pair
        for (let i = 0; i < queueUsers.length; i++) {
            for (let j = i + 1; j < queueUsers.length; j++) {
                const score = this.getMatchScore(queueUsers[i].user!, queueUsers[j].user!);
                if (score > bestScore) {
                    bestScore = score;
                    bestPairIdx1 = i;
                    bestPairIdx2 = j;
                }
            }
        }

        // If no checkpoint matches found, just pair FIFO
        if (bestScore <= 0) {
            bestPairIdx1 = 0;
            bestPairIdx2 = 1;
        }

        const id1 = queueUsers[bestPairIdx1].id;
        const id2 = queueUsers[bestPairIdx2].id;

        console.log("matching " + id1 + " with " + id2 + " (score: " + bestScore + ")");

        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);

        // Remove from queue
        this.queue = this.queue.filter(x => x !== id1 && x !== id2);

        if (!user1 || !user2) {
            return;
        }

        // Notify both users about match quality
        const sharedCheckpoints = this.getSharedCheckpoints(user1, user2);
        const matchPercentage = user1.checkpoints?.length && user2.checkpoints?.length
            ? Math.round((sharedCheckpoints.length / Math.max(user1.checkpoints.length, user2.checkpoints.length)) * 100)
            : 0;

        console.log("creating room with match score:", bestScore, "shared:", sharedCheckpoints);

        const room = this.roomManager.createRoom(user1, user2, sharedCheckpoints, matchPercentage);
        this.clearQueue();
    }

    initHandlers(socket: Socket) {
        socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        })

        socket.on("answer",({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        })

        socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });

        socket.on("chat-message", ({roomId, sender, text}: {roomId: string, sender: string, text: string}) => {
            this.roomManager.onChatMessage(roomId, socket.id, sender, text);
        });

        // Update checkpoints dynamically
        socket.on("update-checkpoints", ({checkpoints}: {checkpoints: string[]}) => {
            const user = this.users.find(x => x.socket.id === socket.id);
            if (user) {
                user.checkpoints = checkpoints;
            }
        });
    }

}