import type { AuthResponse, UserModel } from "../Models/UserModel";

type Listener = () => void;

const STORAGE_KEY = "vacations.auth";

interface PersistedAuth {
    token: string;
    user: UserModel;
}

class AuthStore {
    private state: PersistedAuth | null = null;
    private listeners = new Set<Listener>();

    public constructor() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) this.state = JSON.parse(raw) as PersistedAuth;
        } catch (err) {
            console.warn("AuthStore: corrupt localStorage data cleared.", err);
            localStorage.removeItem(STORAGE_KEY);
            this.state = null;
        }
    }

    public getSnapshot = (): PersistedAuth | null => this.state;

    public subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    public login(payload: AuthResponse): void {
        this.state = { token: payload.token, user: payload.user };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.emit();
    }

    public logout(): void {
        this.state = null;
        localStorage.removeItem(STORAGE_KEY);
        this.emit();
    }

    public get token(): string {
        return this.state?.token ?? "";
    }

    public get user(): UserModel | null {
        return this.state?.user ?? null;
    }

    public get isAuthenticated(): boolean {
        return !!this.state?.token;
    }

    public get isAdmin(): boolean {
        return this.state?.user?.role === "Admin";
    }

    public get isRegularUser(): boolean {
        return this.state?.user?.role === "User";
    }

    private emit(): void {
        for (const listener of this.listeners) listener();
    }
}

export const authStore = new AuthStore();
