class DateUtils {

    public startOfToday(): Date {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    public isActive(startDate: string | Date, endDate: string | Date): boolean {
        const today = this.startOfToday().getTime();
        return new Date(startDate).getTime() <= today && today <= new Date(endDate).getTime();
    }

    public isUpcoming(startDate: string | Date): boolean {
        return new Date(startDate).getTime() > this.startOfToday().getTime();
    }

    public formatRange(startDate: string | Date, endDate: string | Date): string {
        const s = new Date(startDate);
        const e = new Date(endDate);
        const fmt: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
        return `${s.toLocaleDateString(undefined, fmt)} — ${e.toLocaleDateString(undefined, fmt)}`;
    }

    public toInputDate(value: string | Date | undefined): string {
        if (!value) return "";
        const d = new Date(value);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${d.getFullYear()}-${mm}-${dd}`;
    }
}

export const dateUtils = new DateUtils();
