import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserData } from "../api";

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    login: (token: string, user: UserData) => void;
    logout: () => void;
    updateUser: (updates: Partial<UserData>) => void;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
    isLoggedIn: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("fc_token");
        const savedUser = localStorage.getItem("fc_user");
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("fc_token");
                localStorage.removeItem("fc_user");
            }
        }
    }, []);

    const login = (newToken: string, newUser: UserData) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("fc_token", newToken);
        localStorage.setItem("fc_user", JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("fc_token");
        localStorage.removeItem("fc_user");
    };

    const updateUser = (updates: Partial<UserData>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem("fc_user", JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
