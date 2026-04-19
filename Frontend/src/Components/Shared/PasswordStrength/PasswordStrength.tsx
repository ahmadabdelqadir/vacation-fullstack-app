import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Strength = {
    score: 0 | 1 | 2 | 3 | 4;
    label: string;
    colorClass: string;
    hints: string[];
};

function scorePassword(password: string): Strength {
    const hints: string[] = [];
    let score = 0;

    if (!password) {
        return { score: 0, label: "Too short", colorClass: "bg-muted", hints: ["At least 4 characters"] };
    }

    if (password.length >= 4) score++; else hints.push("At least 4 characters");
    if (password.length >= 8) score++; else hints.push("8+ characters for better strength");
    if (/[A-Z]/.test(password)) score++; else hints.push("Add an uppercase letter");
    if (/[0-9]/.test(password)) score++; else hints.push("Add a number");
    if (/[^A-Za-z0-9]/.test(password)) score++; else hints.push("Add a symbol");

    // Cap at 4 so the bar has 4 visible segments.
    const capped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

    const scale: Record<number, { label: string; colorClass: string }> = {
        0: { label: "Too short", colorClass: "bg-destructive" },
        1: { label: "Weak", colorClass: "bg-destructive" },
        2: { label: "Fair", colorClass: "bg-amber-500" },
        3: { label: "Good", colorClass: "bg-[hsl(164_60%_42%)]" },
        4: { label: "Strong", colorClass: "bg-[hsl(164_72%_34%)]" }
    };

    return { score: capped, label: scale[capped].label, colorClass: scale[capped].colorClass, hints: hints.slice(0, 2) };
}

interface Props {
    password: string;
}

export function PasswordStrength({ password }: Props) {
    const strength = useMemo(() => scorePassword(password), [password]);

    return (
        <div className="mt-1 space-y-1.5" aria-live="polite">
            <div className="flex gap-1" role="img" aria-label={`Password strength: ${strength.label}`}>
                {[1, 2, 3, 4].map(segment => (
                    <div
                        key={segment}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors duration-300",
                            segment <= strength.score ? strength.colorClass : "bg-muted"
                        )}
                    />
                ))}
            </div>
            <div className="flex items-center justify-between text-xs">
                <span
                    className={cn(
                        "font-medium transition-colors",
                        strength.score <= 1 ? "text-destructive" :
                        strength.score === 2 ? "text-amber-600" :
                        "text-[hsl(164_72%_28%)]"
                    )}
                >
                    {strength.label}
                </span>
                {strength.hints.length > 0 && password && (
                    <span className="text-muted-foreground">
                        Try: {strength.hints[0].toLowerCase()}
                    </span>
                )}
            </div>
        </div>
    );
}
