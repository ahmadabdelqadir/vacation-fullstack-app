import type { VacationFilter } from "../../../Models/VacationModel";
import "./FilterBar.css";

interface Props {
    value: VacationFilter;
    onChange: (value: VacationFilter) => void;
    likedDisabled?: boolean;
}

const OPTIONS: { value: VacationFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "liked", label: "Liked" },
    { value: "active", label: "Active" },
    { value: "upcoming", label: "Upcoming" }
];

export function FilterBar({ value, onChange, likedDisabled = false }: Props) {
    return (
        <div className="FilterBar" role="tablist" aria-label="Vacation filters">
            {OPTIONS.map(opt => {
                const disabled = opt.value === "liked" && likedDisabled;
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={`FilterBar-option ${active ? "is-active" : ""}`}
                        onClick={() => onChange(opt.value)}
                        disabled={disabled}
                        title={disabled ? "Admins do not have personal likes." : undefined}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
