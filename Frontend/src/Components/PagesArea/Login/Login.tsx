import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { AnimatedBorder } from "../../Shared/AnimatedBorder/AnimatedBorder";
import "../../Shared/AnimatedBorder/AnimatedBorder.css";
import { PasswordInput } from "../../Shared/PasswordInput/PasswordInput";
import { useTitle } from "../../../Hooks/useTitle";
import type { CredentialsModel } from "../../../Models/CredentialsModel";
import { authService } from "../../../Services/AuthService";
import { loginSchema } from "../../../Utils/JoiSchemas";
import { notify } from "../../../Utils/Notify";

interface LocationState {
    from?: { pathname: string };
}

export function Login() {
    useTitle("Login - Vacations");
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = (location.state as LocationState | undefined)?.from?.pathname ?? "/vacations";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<CredentialsModel>({ resolver: joiResolver(loginSchema), mode: "onTouched" });

    async function onSubmit(values: CredentialsModel): Promise<void> {
        try {
            const response = await authService.login(values);
            notify.success(`Welcome back, ${response.user.firstName}!`);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            notify.error(err);
        }
    }

    return (
        <section className="flex items-center justify-center py-6 sm:py-10">
            <AnimatedBorder className="w-full max-w-md">
            <Card className="w-full border-0 shadow-none">
                <CardHeader className="space-y-1.5">
                    <CardTitle className="font-display text-3xl">Welcome back</CardTitle>
                    <CardDescription>Log in to browse, like, and plan your next trip.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="login-email">Email</Label>
                            <Input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                aria-invalid={!!errors.email}
                                {...register("email")}
                            />
                            {errors.email ? (
                                <p role="alert" className="text-sm text-destructive">{errors.email.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="login-password">Password</Label>
                            <PasswordInput
                                id="login-password"
                                autoComplete="current-password"
                                aria-invalid={!!errors.password}
                                {...register("password")}
                            />
                            {errors.password ? (
                                <p role="alert" className="text-sm text-destructive">{errors.password.message}</p>
                            ) : null}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    Log in
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        New here? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link>
                    </p>
                </CardContent>
            </Card>
            </AnimatedBorder>
        </section>
    );
}
