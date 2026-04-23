import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Splash } from "./components/Splash";
import { Auth } from "./components/Auth";
import { Landing } from "./components/Landing";
import { Checkpoints } from "./components/Checkpoints";
import { About } from "./components/About";
import { Profile } from "./components/Profile";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

function AppRoutes() {
    const { isLoggedIn } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={isLoggedIn ? <Navigate to="/home" replace /> : <Auth />} />
            <Route path="/home" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
            <Route path="/checkpoints" element={<ProtectedRoute><Checkpoints /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
