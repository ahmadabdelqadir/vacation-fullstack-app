import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../../../../Hooks/useTitle";
import { adminVacationService, type VacationFormValues } from "../../../../Services/AdminVacationService";
import { notify } from "../../../../Utils/Notify";
import { VacationForm } from "./VacationForm";

export function AddVacation() {
    useTitle("Add vacation - Admin");
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState<boolean>(false);

    async function handleSubmit(values: VacationFormValues): Promise<void> {
        try {
            setSubmitting(true);
            await adminVacationService.create(values);
            notify.success("Vacation created.");
            navigate("/admin/vacations", { replace: true });
        } catch (err) {
            notify.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="AdminPage">
            <header className="AdminPage-header">
                <h1>Add vacation</h1>
                <p>Image is required. Dates cannot be in the past. Price must be 0 - 10,000.</p>
            </header>
            <VacationForm mode="create" submitting={submitting} onSubmit={handleSubmit} />
        </section>
    );
}
