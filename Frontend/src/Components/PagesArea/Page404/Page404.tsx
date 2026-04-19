import { Link } from "react-router-dom";
import "./Page404.css";

export function Page404() {
    return (
        <section className="Page404">
            <div className="Page404-card">
                <p className="Page404-code">404</p>
                <h1 className="Page404-title">We couldn't find that page.</h1>
                <p className="Page404-text">
                    The destination you tried doesn't exist — or it may have moved. Head back home and pick
                    another adventure.
                </p>
                <Link to="/home" className="btn btn-primary">Back to Home</Link>
            </div>
        </section>
    );
}
