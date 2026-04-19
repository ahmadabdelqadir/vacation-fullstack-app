import { joiResolver } from "@hookform/resolvers/joi";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Continent, VacationModel } from "../../../../Models/VacationModel";
import { vacationSchema } from "../../../../Utils/JoiSchemas";
import type { VacationFormValues } from "../../../../Services/AdminVacationService";
import { appConfig } from "../../../../Utils/AppConfig";
import { dateUtils } from "../../../../Utils/DateUtils";
import { FormField } from "../../../Shared/FormField/FormField";
import "./VacationForm.css";

interface Props {
    mode: "create" | "edit";
    initial?: VacationModel;
    submitting?: boolean;
    onSubmit: (values: VacationFormValues) => Promise<void>;
}

const CONTINENTS: Continent[] = [
    "Africa",
    "Asia",
    "Europe",
    "NorthAmerica",
    "SouthAmerica",
    "Oceania",
    "Antarctica"
];

export function VacationForm({ mode, initial, submitting, onSubmit }: Props) {
    const defaults = useMemo<Partial<VacationFormValues>>(
        () => ({
            destination: initial?.destination ?? "",
            description: initial?.description ?? "",
            continent: initial?.continent ?? "",
            startDate: initial ? dateUtils.toInputDate(initial.startDate) : "",
            endDate: initial ? dateUtils.toInputDate(initial.endDate) : "",
            price: initial?.price ?? 0
        }),
        [initial]
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<VacationFormValues>({
        resolver: joiResolver(vacationSchema),
        defaultValues: defaults,
        mode: "onTouched"
    });

    useEffect(() => {
        reset(defaults);
    }, [defaults, reset]);

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        initial ? appConfig.imageUrl(initial.imageFileName) : null
    );

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }

    return (
        <form className="VacationForm" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="VacationForm-grid">
                <div className="VacationForm-main">
                    <FormField
                        label="Destination"
                        autoComplete="off"
                        {...register("destination")}
                        error={errors.destination?.message as string | undefined}
                    />

                    <div className="FormField">
                        <label htmlFor="vacation-description">Description</label>
                        <textarea
                            id="vacation-description"
                            rows={5}
                            {...register("description")}
                            aria-invalid={!!errors.description}
                        />
                        {errors.description ? (
                            <small role="alert" className="FormField-error">
                                {errors.description.message as string}
                            </small>
                        ) : null}
                    </div>

                    <div className="FormField">
                        <label htmlFor="vacation-continent">Continent</label>
                        <select
                            id="vacation-continent"
                            defaultValue={defaults.continent ?? ""}
                            {...register("continent")}
                        >
                            <option value="" disabled>Select a continent...</option>
                            {CONTINENTS.map(continent => (
                                <option key={continent} value={continent}>
                                    {continent.replace(/([A-Z])/g, " $1").trim()}
                                </option>
                            ))}
                        </select>
                        {errors.continent ? (
                            <small role="alert" className="FormField-error">
                                {errors.continent.message as string}
                            </small>
                        ) : null}
                    </div>

                    <div className="VacationForm-dates">
                        <FormField
                            label="Start date"
                            type="date"
                            {...register("startDate")}
                            error={errors.startDate?.message as string | undefined}
                        />
                        <FormField
                            label="End date"
                            type="date"
                            {...register("endDate")}
                            error={errors.endDate?.message as string | undefined}
                        />
                    </div>

                    <FormField
                        label="Price (USD)"
                        type="number"
                        step="1"
                        min={0}
                        max={10000}
                        {...register("price", { valueAsNumber: true })}
                        error={errors.price?.message as string | undefined}
                    />
                </div>

                <aside className="VacationForm-media">
                    <div className="VacationForm-preview" aria-hidden="true">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Vacation preview" />
                        ) : (
                            <div className="VacationForm-placeholder">Image preview</div>
                        )}
                    </div>
                    <div className="FormField">
                        <label htmlFor="vacation-image">
                            Image {mode === "edit" ? "(optional - keep existing if blank)" : "(required)"}
                        </label>
                        <input
                            id="vacation-image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            {...register("image", { onChange: handleImageChange })}
                        />
                    </div>
                </aside>
            </div>

            <div className="VacationForm-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Saving..." : mode === "create" ? "Create vacation" : "Save changes"}
                </button>
            </div>
        </form>
    );
}
