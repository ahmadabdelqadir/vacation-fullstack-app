import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTitle } from "../../../../Hooks/useTitle";
import { reportService, type DestinationLikes } from "../../../../Services/ReportService";
import { notify } from "../../../../Utils/Notify";
import { Spinner } from "../../../Shared/Spinner/Spinner";
import "./Reports.css";

export function Reports() {
    useTitle("Reports - Admin");
    const [data, setData] = useState<DestinationLikes[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [downloading, setDownloading] = useState<boolean>(false);

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const rows = await reportService.json();
                setData(rows);
            } catch (err) {
                notify.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleDownload(): Promise<void> {
        try {
            setDownloading(true);
            await reportService.downloadCsv();
            notify.success("CSV downloaded.");
        } catch (err) {
            notify.error(err);
        } finally {
            setDownloading(false);
        }
    }

    return (
        <section className="Reports">
            <header className="Reports-header">
                <div>
                    <h1>Likes report</h1>
                    <p className="Reports-subtitle">Vacation destination vs. total likes.</p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleDownload}
                    disabled={downloading || data.length === 0}
                >
                    {downloading ? "Preparing..." : "Download CSV"}
                </button>
            </header>

            {loading && <Spinner label="Loading report..." />}

            {!loading && data.length === 0 && (
                <div className="Reports-empty">
                    <p>No likes have been recorded yet.</p>
                </div>
            )}

            {!loading && data.length > 0 && (
                <div className="Reports-chartWrap">
                    <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 60, left: 10 }}>
                            <CartesianGrid stroke="#e5eaf1" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="destination"
                                angle={-25}
                                textAnchor="end"
                                interval={0}
                                tick={{ fontSize: 12 }}
                                height={80}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: "rgba(14,110,158,0.08)" }} />
                            <Bar dataKey="likes" fill="#0e6e9e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}
