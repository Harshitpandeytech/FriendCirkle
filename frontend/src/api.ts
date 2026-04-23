const API_BASE = "http://localhost:3000/api";

export interface UserData {
    id: string;
    email: string;
    name: string;
    college: string;
    avatar: "male" | "female";
    checkpoints: string[];
    friendCount: number;
    xp: number;
}

export interface AuthResponse {
    token: string;
    user: UserData;
}

function getToken(): string | null {
    return localStorage.getItem("fc_token");
}

function getHeaders(): Record<string, string> {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

export async function apiRegister(
    email: string,
    password: string,
    name: string,
    avatar: string
): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, avatar }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
}

export async function apiGetProfile(): Promise<UserData & { friends: string[]; createdAt: string }> {
    const res = await fetch(`${API_BASE}/user/profile`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get profile");
    return data;
}

export async function apiUpdateCheckpoints(checkpoints: string[]): Promise<{ checkpoints: string[] }> {
    const res = await fetch(`${API_BASE}/user/checkpoints`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ checkpoints }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    return data;
}

export async function apiAddFriend(friendId: string): Promise<{ friendCount: number; xp: number }> {
    const res = await fetch(`${API_BASE}/user/add-friend`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ friendId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add friend");
    return data;
}

export async function apiReport(reportedUserId: string, reason: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/user/report`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ reportedUserId, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to report");
    return data;
}

export async function apiGetFriends(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/user/friends`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get friends");
    return data.friends;
}

export async function apiGetCheckpointList(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/auth/checkpoints`);
    const data = await res.json();
    return data.checkpoints;
}
