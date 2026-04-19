import { Toaster } from "@/Components/ui/sonner";
import { DotPattern } from "../../Shared/DotPattern/DotPattern";
import { Header } from "../Header/Header";
import { Menu } from "../Menu/Menu";
import { Routing } from "../Routing/Routing";
import "./Layout.css";

export function Layout() {
    return (
        <div className="Layout">
            <DotPattern />
            <header>
                <Header />
            </header>

            <nav>
                <Menu />
            </nav>

            <main>
                <Routing />
            </main>

            <footer className="Layout-footer">
                <small>(c) {new Date().getFullYear()} Vacations. Built with Ahmad Abd el Qadir.</small>
            </footer>

            <Toaster />
        </div>
    );
}
