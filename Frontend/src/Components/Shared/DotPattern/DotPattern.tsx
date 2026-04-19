import { cn } from "@/lib/utils";

// Background dot pattern. Drawn with a plain CSS radial gradient,
// fixed to the viewport, and sits behind the rest of the page.
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
