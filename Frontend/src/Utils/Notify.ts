import { toast } from "sonner";

class Notify {
    public success(message: string): void {
        toast.success(message);
    }

    public error(err: unknown): void {
        toast.error(this.toMessage(err));
    }

    public info(message: string): void {
        toast(message);
    }

    private toMessage(err: unknown): string {
        if (!err) return "Something went wrong.";
        if (typeof err === "string") return err;
        const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
        if (anyErr.response?.data?.message) return anyErr.response.data.message;
        if (anyErr.message) return anyErr.message;
        return "Unexpected error.";
    }
}

export const notify = new Notify();
