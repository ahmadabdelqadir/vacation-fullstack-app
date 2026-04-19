import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";

interface Props {
    children: ReactNode;
}

export function AdminRoute({ children }: Props) {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/vacations" replace />;
    return <>{children}</>;
}
