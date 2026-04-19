import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useTitle } from "../../../Hooks/useTitle";
import { aiService } from "../../../Services/AiService";
import { notify } from "../../../Utils/Notify";

export function Recommendations() {
    useTitle("AI Recommendation - Vacations");

    const [destination, setDestination] = useState<string>("");
    const [recommendation, setRecommendation] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        const trimmed = destination.trim();
        if (trimmed.length < 2) {
            notify.error("Please enter a destination (at least 2 characters).");
            return;
        }
        setLoading(true);
        setRecommendation("");
        try {
            const response = await aiService.recommend(trimmed);
            setRecommendation(response.text);
        } catch (err) {
            notify.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <header>
                <h1 className="font-display text-3xl sm:text-4xl">AI Travel Recommendation</h1>
                <p className="mt-1 text-muted-foreground">
                    Tell us a destination and get a concise plan with highlights, the best time to visit,
                    and a local phrase to pocket for the trip.
                </p>
            </header>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Label htmlFor="rec-destination">Destination</Label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                id="rec-destination"
                                value={destination}
                                onChange={event => setDestination(event.target.value)}
                                placeholder="e.g. Tokyo, Cape Town, Reykjavik..."
                                maxLength={80}
                                autoComplete="off"
                                className="flex-1"
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Thinking...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="h-4 w-4" />
                                        Ask AI
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {!loading && recommendation && (
                <Card className="border-l-4 border-l-primary shadow-sm" aria-live="polite">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-display text-xl text-primary">
                            <Sparkles className="h-5 w-5" />
                            Your itinerary starter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap leading-relaxed">{recommendation}</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !recommendation && (
                <Card className="border border-dashed bg-muted/30">
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No recommendation yet - enter a destination above to get started.
                    </CardContent>
                </Card>
            )}
        </section>
    );
}
