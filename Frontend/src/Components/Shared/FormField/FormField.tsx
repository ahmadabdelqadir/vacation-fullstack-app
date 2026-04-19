import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import "./FormField.css";

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    help?: ReactNode;
};

// Labelled input component. Uses React's useId so the label's htmlFor
// always points at a unique id, even when several FormFields share the page.
export const FormField = forwardRef<HTMLInputElement, Props>(function FormField(
    { label, error, help, id, ...rest },
    ref
) {
    const autoId = useId();
    const fieldId = id ?? autoId;

    return (
        <div className={`FormField ${error ? "has-error" : ""}`}>
            <label htmlFor={fieldId}>{label}</label>
            <input id={fieldId} ref={ref} aria-invalid={!!error} {...rest} />
            {error ? <small role="alert" className="FormField-error">{error}</small> : null}
            {!error && help ? <small className="FormField-help">{help}</small> : null}
        </div>
    );
});
