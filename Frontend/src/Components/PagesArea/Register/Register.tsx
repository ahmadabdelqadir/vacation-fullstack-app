import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useTitle } from "../../../Hooks/useTitle";
import type { RegisterModel } from "../../../Models/CredentialsModel";
import { authService } from "../../../Services/AuthService";
import { registerSchema } from "../../../Utils/JoiSchemas";
import { notify } from "../../../Utils/Notify";
import { AnimatedBorder } from "../../Shared/AnimatedBorder/AnimatedBorder";
import "../../Shared/AnimatedBorder/AnimatedBorder.css";
import { PasswordInput } from "../../Shared/PasswordInput/PasswordInput";
import { PasswordStrength } from "../../Shared/PasswordStrength/PasswordStrength";

export function Register() {
    useTitle("Create your account - Vacations");
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<RegisterModel>({ resolver: joiResolver(registerSchema), mode: "onTouched" });

    const passwordValue = watch("password") ?? "";

    async function onSubmit(values: RegisterModel): Promise<void> {
        try {
            const response = await authService.register(values);
            notify.success(`Welcome, ${response.user.firstName}!`);
            navigate("/vacations", { replace: true });
        } catch (err) {
            notify.error(err);
        }
    }

    return (
        <section className="flex items-center justify-center py-6 sm:py-10">
            <AnimatedBorder className="w-full max-w-xl">
            <Card className="w-full border-0 shadow-none">
                <CardHeader className="space-y-1.5">
                    <CardTitle className="font-display text-3xl">Create your account</CardTitle>
                    <CardDescription>Takes less than a minute.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-firstName">First name</Label>
                                <Input
                                    id="reg-firstName"
                                    autoComplete="given-name"
                                    aria-invalid={!!errors.firstName}
                                    {...register("firstName")}
                                />
                                {errors.firstName ? (
                                    <p role="alert" className="text-sm text-destructive">{errors.firstName.message}</p>
                                ) : null}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="reg-lastName">Last name</Label>
                                <Input
                                    id="reg-lastName"
                                    autoComplete="family-name"
                                    aria-invalid={!!errors.lastName}
                                    {...register("lastName")}
                                />
                                {errors.lastName ? (
                                    <p role="alert" className="text-sm text-destructive">{errors.lastName.message}</p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="reg-email">Email</Label>
                            <Input
                                id="reg-email"
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
                            <Label htmlFor="reg-password">Password</Label>
                            <PasswordInput
                                id="reg-password"
                                autoComplete="new-password"
                                aria-invalid={!!errors.password}
                                {...register("password")}
                            />
                            <PasswordStrength password={passwordValue} />
                            {errors.password ? (
                                <p role="alert" className="text-sm text-destructive">{errors.password.message}</p>
                            ) : null}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Create account
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
                    </p>
                </CardContent>
            </Card>
            </AnimatedBorder>
        </section>
    );
}
