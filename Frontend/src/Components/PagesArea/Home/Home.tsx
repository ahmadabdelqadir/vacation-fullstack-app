import { ArrowRight, LogIn, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { useAuth } from "../../../Hooks/useAuth";
import { useTitle } from "../../../Hooks/useTitle";
import "./Home.css";

export function Home() {
    useTitle("Vacations - Discover your next trip");
    const { isAuthenticated, isAdmin, user } = useAuth();

    return (
        <section className="Home">
            <div className="Home-hero">
                <div className="Home-blob Home-blob--1" aria-hidden="true" />
                <div className="Home-blob Home-blob--2" aria-hidden="true" />
                <div className="Home-blob Home-blob--3" aria-hidden="true" />
                <div className="Home-grid" aria-hidden="true" />

                <div className="Home-heroContent">
                    <Badge className="Home-eyebrow gap-1.5 border-white/30 bg-white/15 text-white hover:bg-white/20 backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" />
                        Travel smarter
                    </Badge>

                    <h1 className="Home-title">
                        Find the vacation <span className="Home-title-accent">you didn't know</span> you wanted.
                    </h1>

                    <p className="Home-subtitle">
                        Browse curated trips, save your favorites, and get AI-powered recommendations
                        tuned to where you actually want to go.
                    </p>

                    <div className="Home-ctaRow">
                        {isAuthenticated ? (
                            <>
                                <Button asChild size="lg" className="Home-cta-primary">
                                    <Link to={isAdmin ? "/admin/vacations" : "/vacations"}>
                                        <MapPin className="h-4 w-4" />
                                        {isAdmin ? "Manage vacations" : "Browse vacations"}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <span className="Home-welcome">
                                    Welcome back, {user?.firstName}.
                                </span>
                            </>
                        ) : (
                            <>
                                <Button asChild size="lg" className="Home-cta-primary">
                                    <Link to="/register">
                                        Create an account
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild variant="secondary" size="lg" className="Home-cta-secondary">
                                    <Link to="/login">
                                        <LogIn className="h-4 w-4" />
                                        I already have an account
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="Home-stats" aria-hidden="true">
                        <div className="Home-stat">
                            <span className="Home-stat-num">12+</span>
                            <span className="Home-stat-label">Curated trips</span>
                        </div>
                        <div className="Home-stat-divider" />
                        <div className="Home-stat">
                            <span className="Home-stat-num">7</span>
                            <span className="Home-stat-label">Continents</span>
                        </div>
                        <div className="Home-stat-divider" />
                        <div className="Home-stat">
                            <span className="Home-stat-num">AI</span>
                            <span className="Home-stat-label">Recommendations</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
