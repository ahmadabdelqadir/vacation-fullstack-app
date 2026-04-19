import "./Spinner.css";

export function Spinner({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="Spinner" role="status" aria-live="polite">
            <span className="Spinner-dot"></span>
            <span className="Spinner-dot"></span>
            <span className="Spinner-dot"></span>
            <span className="Spinner-text">{label}</span>
        </div>
    );
}
