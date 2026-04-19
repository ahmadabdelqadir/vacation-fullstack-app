class CsvHelper {
    // Builds a CSV string. Starts with a UTF-8 BOM so Excel opens it correctly,
    // and quotes any cell that has a comma, quote, or newline inside it.
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
