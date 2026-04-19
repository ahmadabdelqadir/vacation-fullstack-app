import "./Paginator.css";

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
}

export function Paginator({ page, pageSize, total, onChange }: Props) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (totalPages <= 1) return null;

    const pages = buildPageList(page, totalPages);

    return (
        <nav className="Paginator" aria-label="Pagination">
            <button
                type="button"
                className="Paginator-btn"
                onClick={() => onChange(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Previous page"
            >
                ‹
            </button>
            {pages.map((pageNumber, index) =>
                pageNumber === "…" ? (
                    <span key={`gap-${index}`} className="Paginator-gap">…</span>
                ) : (
                    <button
                        key={pageNumber}
                        type="button"
                        className={`Paginator-btn ${pageNumber === page ? "is-active" : ""}`}
                        aria-current={pageNumber === page ? "page" : undefined}
                        onClick={() => onChange(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                )
            )}
            <button
                type="button"
                className="Paginator-btn"
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
            >
                ›
            </button>
        </nav>
    );
}

/**
 * Build a compact page list showing first, last, the current page,
 * and one neighbor on each side. Example for current=5, total=10:
 * [1, "…", 4, 5, 6, "…", 10].
 */
function buildPageList(currentPage: number, totalPages: number): Array<number | "…"> {
    const neighborRadius = 1;
    const pageList: Array<number | "…"> = [];
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const isEdge = pageNumber === 1 || pageNumber === totalPages;
        const isNearCurrent =
            pageNumber >= currentPage - neighborRadius &&
            pageNumber <= currentPage + neighborRadius;
        if (isEdge || isNearCurrent) {
            pageList.push(pageNumber);
        } else if (pageList[pageList.length - 1] !== "…") {
            pageList.push("…");
        }
    }
    return pageList;
}
