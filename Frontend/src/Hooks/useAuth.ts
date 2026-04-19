import { useSyncExternalStore } from "react";
import { authStore } from "../Stores/AuthStore";

export function useAuth() {
    const snapshot = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
    return {
        isAuthenticated: !!snapshot?.token,
        isAdmin: snapshot?.user?.role === "Admin",
        isRegularUser: snapshot?.user?.role === "User",
        user: snapshot?.user ?? null,
        token: snapshot?.token ?? ""
    };
}
