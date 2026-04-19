import { NavLink } from "react-router-dom";
import "./Header.css";

export function Header() {
    return (
        <div className="Header">
            <NavLink to="/home" className="Header-brand" aria-label="Vacations home">
                <span className="Header-logo" aria-hidden="true">✈</span>
                <span className="Header-title">Vacations</span>
            </NavLink>
            <span className="Header-tagline">Discover. Like. Travel.</span>
        </div>
    );
}
