import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../Hooks/useAuth";
import { useTitle } from "../../../Hooks/useTitle";
import type { PageResultModel, VacationFilter, VacationModel } from "../../../Models/VacationModel";
import { vacationService } from "../../../Services/VacationService";
import { appConfig } from "../../../Utils/AppConfig";
import { notify } from "../../../Utils/Notify";
import { FilterBar } from "../../Shared/FilterBar/FilterBar";
import { Paginator } from "../../Shared/Paginator/Paginator";
import { Spinner } from "../../Shared/Spinner/Spinner";
import { VacationCard } from "../VacationCard/VacationCard";
import "./VacationsPage.css";

const VALID_FILTERS: VacationFilter[] = ["all", "liked", "active", "upcoming"];

export function VacationsPage() {
    useTitle("Vacations - Browse trips");
    const { isRegularUser, isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const initialFilterRaw = (searchParams.get("filter") ?? "all") as VacationFilter;
    const initialFilter: VacationFilter = VALID_FILTERS.includes(initialFilterRaw) ? initialFilterRaw : "all";

    const [page, setPage] = useState<number>(initialPage);
    const [filter, setFilter] = useState<VacationFilter>(
        isAdmin && initialFilter === "liked" ? "all" : initialFilter
    );
    const [result, setResult] = useState<PageResultModel<VacationModel> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await vacationService.list({ page, filter });
            setResult(data);
        } catch (err) {
            notify.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        load();
    }, [load]);

    // Keep the ?page=X&filter=Y query string in sync with our state
    // so refreshing the page or sharing a link stays on the same view.
    useEffect(() => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("filter", filter);
        setSearchParams(params, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filter]);

    function handleFilterChange(value: VacationFilter): void {
        setFilter(value);
        setPage(1);
    }

    async function handleToggleLike(vacation: VacationModel): Promise<void> {
        try {
            const response = vacation.isLikedByCurrentUser
                ? await vacationService.unlike(vacation._id)
                : await vacationService.like(vacation._id);
            setResult(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.map(item =>
                        item._id === vacation._id
                            ? { ...item, isLikedByCurrentUser: response.liked, totalLikes: response.totalLikes }
                            : item
                    )
                };
            });
        } catch (err) {
            notify.error(err);
        }
    }

    const items = result?.items ?? [];
    const total = result?.total ?? 0;
    const pageSize = result?.pageSize ?? appConfig.vacationsPerPage;

    return (
        <section className="VacationsPage">
            <header className="VacationsPage-header">
                <div>
                    <h1 className="VacationsPage-title">Find your next trip</h1>
                    <p className="VacationsPage-subtitle">
                        {total > 0
                            ? `${total} trips available — sorted by start date.`
                            : "Loading trips..."}
                    </p>
                </div>
                <FilterBar value={filter} onChange={handleFilterChange} likedDisabled={!isRegularUser} />
            </header>

            {loading && <Spinner label="Loading vacations..." />}

            <AnimatePresence mode="wait">
                {!loading && items.length === 0 && (
                    <motion.div
                        key="empty"
                        className="VacationsPage-empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >
                        <h2>No vacations match this filter.</h2>
                        <p>Try another filter, or check back soon — admins add new trips regularly.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="VacationsPage-grid"
                key={`${filter}-${page}`}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 1 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
            >
                <AnimatePresence mode="popLayout">
                    {items.map(item => (
                        <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
                            transition={{ duration: 0.32, ease: [0.22, 0.9, 0.32, 1] }}
                        >
                            <VacationCard
                                vacation={item}
                                canLike={isRegularUser}
                                canManage={false}
                                onToggleLike={isRegularUser ? handleToggleLike : undefined}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <Paginator page={page} pageSize={pageSize} total={total} onChange={setPage} />
        </section>
    );
}
