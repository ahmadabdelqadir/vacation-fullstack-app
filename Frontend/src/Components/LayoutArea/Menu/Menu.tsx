import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";
import { authService } from "../../../Services/AuthService";
import "./Menu.css";

export function Menu() {
    const { isAuthenticated, isAdmin, isRegularUser, user } = useAuth();
    const navigate = useNavigate();

    function handleLogout(): void {
        authService.logout();
        navigate("/home", { replace: true });
    }

    return (
        <div className="Menu">
            <div className="Menu-inner">
                <NavLink to="/home" className="Menu-link">Home</NavLink>

                {!isAuthenticated && (
                    <>
                        <NavLink to="/login" className="Menu-link">Login</NavLink>
                        <NavLink to="/register" className="Menu-link">Register</NavLink>
                    </>
                )}

                {isRegularUser && (
                    <>
                        <NavLink to="/vacations" className="Menu-link">Vacations</NavLink>
                        <NavLink to="/recommendations" className="Menu-link">AI Recommendation</NavLink>
                        <NavLink to="/mcp" className="Menu-link">MCP Questions</NavLink>
                    </>
                )}

                {isAdmin && (
                    <>
                        <NavLink to="/admin/vacations" className="Menu-link">Manage Vacations</NavLink>
                        <NavLink to="/admin/reports" className="Menu-link">Reports</NavLink>
                    </>
                )}

                {isAuthenticated && (
                    <span className="Menu-user">
                        Hello, <strong>{user?.firstName} {user?.lastName}</strong>
                        <button type="button" className="Menu-logout" onClick={handleLogout}>Logout</button>
                    </span>
                )}
            </div>
        </div>
    );
}
