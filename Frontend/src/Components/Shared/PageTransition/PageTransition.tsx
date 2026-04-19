import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

// Adds a small fade and upward slide animation when a route mounts.
export function PageTransition({ children }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 0.9, 0.32, 1] }}
        >
            {children}
        </motion.div>
    );
}
