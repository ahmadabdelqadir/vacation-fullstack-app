import { cn } from "@/lib/utils";

/**
 * Decorative dot-grid background rendered via a CSS radial-gradient.
 * Fixed to the viewport, non-interactive, behind everything else.
 */
interface Props {
    className?: string;
}

export function DotPattern({ className }: Props) {
    return (
        <div
            className={cn(
                "pointer-events-none fixed inset-0 -z-10",
                "opacity-[0.35]",
                className
            )}
            aria-hidden="true"
            style={{
                backgroundImage:
                    "radial-gradient(circle, hsl(var(--primary) / 0.25) 1px, transparent 1px)",
                backgroundSize: "28px 28px"
            }}
        />
    );
}
