class CsvHelper {
    /**
     * Build a UTF-8 CSV string with a BOM prefix so Excel opens it
     * correctly, and quote any cell that contains a comma, quote, or
     * newline.
     */
    public build(header: string[], rows: Array<Array<string | number>>): string {
        const lines = [this.toRow(header), ...rows.map(row => this.toRow(row))];
        return "\uFEFF" + lines.join("\r\n") + "\r\n";
    }

    private toRow(cells: Array<string | number>): string {
        return cells.map(cell => this.escape(String(cell ?? ""))).join(",");
    }

    private escape(value: string): string {
        if (/[",\r\n]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}

export const csvHelper = new CsvHelper();
