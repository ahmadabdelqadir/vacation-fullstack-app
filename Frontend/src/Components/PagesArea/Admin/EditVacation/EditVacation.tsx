import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTitle } from "../../../../Hooks/useTitle";
import type { VacationModel } from "../../../../Models/VacationModel";
import {
    adminVacationService,
    type VacationFormValues
} from "../../../../Services/AdminVacationService";
import { vacationService } from "../../../../Services/VacationService";
import { notify } from "../../../../Utils/Notify";
import { Spinner } from "../../../Shared/Spinner/Spinner";
import { VacationForm } from "../AddVacation/VacationForm";
import "../AddVacation/AddVacation.css";

export function EditVacation() {
    useTitle("Edit vacation - Admin");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [vacation, setVacation] = useState<VacationModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        async function load(): Promise<void> {
            if (!id) return;
            try {
                const data = await vacationService.one(id);
                setVacation(data);
            } catch (err) {
                notify.error(err);
                navigate("/admin/vacations", { replace: true });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, navigate]);

    async function handleSubmit(values: VacationFormValues): Promise<void> {
        if (!id) return;
        try {
            setSubmitting(true);
            await adminVacationService.update(id, values);
            notify.success("Vacation updated.");
            navigate("/admin/vacations", { replace: true });
        } catch (err) {
            notify.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <section className="AdminPage">
                <Spinner label="Loading vacation..." />
            </section>
        );
    }

    if (!vacation) return null;

    return (
        <section className="AdminPage">
            <header className="AdminPage-header">
                <h1>Edit vacation</h1>
                <p>Image replacement is optional. End date must stay on or after start date.</p>
            </header>
            <VacationForm mode="edit" initial={vacation} submitting={submitting} onSubmit={handleSubmit} />
        </section>
    );
}
