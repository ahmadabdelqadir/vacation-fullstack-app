import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Wraps its children with a rotating conic-gradient ring. The inner
 * surface sits above the ring so only a thin glow border shows.
 */
interface Props {
    children: ReactNode;
    className?: string;
    borderRadius?: string;
}

export function AnimatedBorder({ children, className, borderRadius = "14px" }: Props) {
    return (
        <div className={cn("AnimatedBorder-wrap", className)} style={{ borderRadius }}>
            <div className="AnimatedBorder-glow" aria-hidden="true" />
            <div className="AnimatedBorder-inner" style={{ borderRadius: `calc(${borderRadius} - 2px)` }}>
                {children}
            </div>
        </div>
    );
}
