import { Eye, EyeOff } from "lucide-react";
import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Input } from "@/Components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

// Password field with a small eye button that toggles between hiding
// and showing the text. Forwards the ref so react-hook-form's register() works.
export const PasswordInput = forwardRef<HTMLInputElement, Props>(
    function PasswordInput({ className, ...rest }, ref) {
        const [isVisible, setIsVisible] = useState(false);
        const ToggleIcon = isVisible ? EyeOff : Eye;

        const toggleLabel = isVisible ? "Hide password" : "Show password";

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={isVisible ? "text" : "password"}
                    className={cn("pr-10", className)}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={() => setIsVisible(previous => !previous)}
                    aria-label={toggleLabel}
                    aria-pressed={isVisible}
                    title={toggleLabel}
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md",
                        "text-muted-foreground transition-colors hover:text-foreground hover:bg-accent",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    )}
                >
                    <ToggleIcon className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        );
    }
);
