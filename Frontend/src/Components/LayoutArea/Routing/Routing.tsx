import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";
import { AddVacation } from "../../PagesArea/Admin/AddVacation/AddVacation";
import { AdminVacations } from "../../PagesArea/Admin/AdminVacations/AdminVacations";
import { EditVacation } from "../../PagesArea/Admin/EditVacation/EditVacation";
import { Reports } from "../../PagesArea/Admin/Reports/Reports";
import { Home } from "../../PagesArea/Home/Home";
import { Login } from "../../PagesArea/Login/Login";
import { McpQuestions } from "../../PagesArea/McpQuestions/McpQuestions";
import { Page404 } from "../../PagesArea/Page404/Page404";
import { Recommendations } from "../../PagesArea/Recommendations/Recommendations";
import { Register } from "../../PagesArea/Register/Register";
import { VacationsPage } from "../../PagesArea/VacationsPage/VacationsPage";
import { PageTransition } from "../../Shared/PageTransition/PageTransition";
import { AdminRoute } from "../AdminRoute/AdminRoute";
import { ProtectedRoute } from "../ProtectedRoute/ProtectedRoute";

export function Routing() {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    const defaultAuthedPath = isAdmin ? "/admin/vacations" : "/vacations";

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={<Navigate to={isAuthenticated ? defaultAuthedPath : "/home"} replace />}
                />
                <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

                <Route
                    path="/vacations"
                    element={
                        <ProtectedRoute>
                            <PageTransition><VacationsPage /></PageTransition>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recommendations"
                    element={
                        <ProtectedRoute>
                            <PageTransition><Recommendations /></PageTransition>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mcp"
                    element={
                        <ProtectedRoute>
                            <PageTransition><McpQuestions /></PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/vacations"
                    element={
                        <AdminRoute>
                            <PageTransition><AdminVacations /></PageTransition>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/vacations/new"
                    element={
                        <AdminRoute>
                            <PageTransition><AddVacation /></PageTransition>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/vacations/:id/edit"
                    element={
                        <AdminRoute>
                            <PageTransition><EditVacation /></PageTransition>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <AdminRoute>
                            <PageTransition><Reports /></PageTransition>
                        </AdminRoute>
                    }
                />

                <Route path="*" element={<PageTransition><Page404 /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
}
