import { Bot, Loader2, MessageSquareText, Send } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { useTitle } from "../../../Hooks/useTitle";
import { mcpService, type McpAskResponse } from "../../../Services/McpService";
import { notify } from "../../../Utils/Notify";

const SAMPLE_QUESTIONS = [
    "How many active holidays are there currently?",
    "What is the average price of the holidays?",
    "What future holidays are there for European countries?"
];

export function McpQuestions() {
    useTitle("MCP Questions - Vacations");

    const [question, setQuestion] = useState<string>("");
    const [response, setResponse] = useState<McpAskResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function submitQuestion(rawQuestion: string): Promise<void> {
        const trimmed = rawQuestion.trim();
        if (trimmed.length < 3) {
            notify.error("Please ask a longer question.");
            return;
        }
        setLoading(true);
        setResponse(null);
        try {
            const result = await mcpService.ask(trimmed);
            setResponse(result);
        } catch (err) {
            notify.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        await submitQuestion(question);
    }

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <header>
                <h1 className="flex items-center gap-2 font-display text-3xl sm:text-4xl">
                    <Bot className="h-7 w-7 text-primary" />
                    Ask the database
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Natural-language questions answered by our backend MCP server and its vacation tools.
                </p>
            </header>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Label htmlFor="mcp-question">Question</Label>
                        <Textarea
                            id="mcp-question"
                            value={question}
                            onChange={event => setQuestion(event.target.value)}
                            placeholder="e.g. How many active holidays are there currently?"
                            rows={3}
                            maxLength={400}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Asking...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Ask
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div>
                <p className="mb-2 text-sm text-muted-foreground">Try a sample question:</p>
                <div className="flex flex-wrap gap-2">
                    {SAMPLE_QUESTIONS.map(sample => (
                        <Button
                            key={sample}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                                setQuestion(sample);
                                submitQuestion(sample);
                            }}
                            disabled={loading}
                        >
                            {sample}
                        </Button>
                    ))}
                </div>
            </div>

            {!loading && response && (
                <Card className="border-l-4 border-l-[hsl(164_72%_34%)] shadow-sm" aria-live="polite">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-display text-xl text-[hsl(164_72%_28%)]">
                            <MessageSquareText className="h-5 w-5" />
                            Answer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="leading-relaxed">{response.answer}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {response.toolUsed && (
                                <Badge variant="secondary" className="font-mono">
                                    tool: {response.toolUsed}
                                </Badge>
                            )}
                            <Badge variant="outline" className="font-mono">mode: {response.mode}</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!loading && !response && (
                <Card className="border border-dashed bg-muted/30">
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Ask anything about active, upcoming, European, or most-liked vacations.
                    </CardContent>
                </Card>
            )}
        </section>
    );
}
