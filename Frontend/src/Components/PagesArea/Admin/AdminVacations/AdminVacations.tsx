import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTitle } from "../../../../Hooks/useTitle";
import type { PageResultModel, VacationModel } from "../../../../Models/VacationModel";
import { adminVacationService } from "../../../../Services/AdminVacationService";
import { vacationService } from "../../../../Services/VacationService";
import { appConfig } from "../../../../Utils/AppConfig";
import { notify } from "../../../../Utils/Notify";
import { ConfirmDialog } from "../../../Shared/ConfirmDialog/ConfirmDialog";
import { Paginator } from "../../../Shared/Paginator/Paginator";
import { Spinner } from "../../../Shared/Spinner/Spinner";
import { VacationCard } from "../../VacationCard/VacationCard";
import "./AdminVacations.css";

export function AdminVacations() {
    useTitle("Manage Vacations - Admin");
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const [page, setPage] = useState<number>(initialPage);
    const [result, setResult] = useState<PageResultModel<VacationModel> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [toDelete, setToDelete] = useState<VacationModel | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await vacationService.list({ page, filter: "all" });
            setResult(data);
        } catch (err) {
            notify.error(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(page));
        setSearchParams(next, { replace: true });
    }, [page, searchParams, setSearchParams]);

    async function confirmDelete(): Promise<void> {
        if (!toDelete) return;
        try {
            await adminVacationService.remove(toDelete._id);
            notify.success("Vacation deleted.");
            setToDelete(null);
            await load();
        } catch (err) {
            notify.error(err);
        }
    }

    const items = result?.items ?? [];
    const total = result?.total ?? 0;
    const pageSize = result?.pageSize ?? appConfig.vacationsPerPage;

    return (
        <section className="AdminVacations">
            <header className="AdminVacations-header">
                <div>
                    <h1>Manage vacations</h1>
                    <p className="AdminVacations-subtitle">{total} total vacations</p>
                </div>
                <Link className="btn btn-primary" to="/admin/vacations/new">+ New vacation</Link>
            </header>

            {loading && <Spinner label="Loading vacations..." />}

            {!loading && items.length === 0 && (
                <div className="AdminVacations-empty">
                    <h2>No vacations yet.</h2>
                    <p>Create the first one to get started.</p>
                </div>
            )}

            <div className="AdminVacations-grid">
                {items.map(item => (
                    <VacationCard
                        key={item._id}
                        vacation={item}
                        canLike={false}
                        canManage
                        onDelete={setToDelete}
                    />
                ))}
            </div>

            <Paginator page={page} pageSize={pageSize} total={total} onChange={setPage} />

            <ConfirmDialog
                open={!!toDelete}
                title="Delete vacation?"
                message={`This will permanently remove "${toDelete?.destination ?? ""}" and all its likes.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </section>
    );
}
