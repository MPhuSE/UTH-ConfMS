import React, { useEffect, useState, useMemo } from "react";
import { useAuditStore } from "../../../app/store/useAuditStore";

export default function AuditLog() {
    const { logs, isLoading, fetchLogs } = useAuditStore();

    const [selectedLog, setSelectedLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        return logs.filter((log) => {
            const matchesSearch =
                (log.user_full_name || log.user_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.resource_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.description || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesAction = actionFilter === "ALL" || log.action_type === actionFilter;

            return matchesSearch && matchesAction;
        });
    }, [logs, searchTerm, actionFilter]);

    return (
        <div className="flex flex-col font-sans antialiased">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Audit Logs</h1>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search actor, resource, desc..."
                        className="px-3 py-1.5 text-xs border border-gray-300 outline-none focus:border-[rgb(0,134,137)] w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        className="px-3 py-1.5 text-xs border border-gray-300 outline-none focus:border-[rgb(0,134,137)] bg-white font-bold cursor-pointer"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                    >
                        <option value="ALL">ALL ACTIONS</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                    </select>

                </div>
            </div>

            <div className="border border-gray-200 bg-white">
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: "rgb(0, 134, 137)" }}>
                            <th className="w-[18%] p-3 text-left text-white text-[11px] uppercase font-bold border-r border-white/10">Time</th>
                            <th className="w-[15%] p-3 text-left text-white text-[11px] uppercase font-bold border-r border-white/10">Actor</th>
                            <th className="w-[12%] p-3 text-center text-white text-[11px] uppercase font-bold border-r border-white/10">Action</th>
                            <th className="w-[18%] p-3 text-left text-white text-[11px] uppercase font-bold border-r border-white/10">Resource</th>
                            <th className="w-[37%] p-3 text-left text-white text-[11px] uppercase font-bold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px]">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-10 text-center text-gray-400">Loading...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">No logs found.</td></tr>
                        ) : filteredLogs.map((log, index) => (
                            <tr key={log._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-3 text-gray-500 font-mono text-[11px] border-r border-gray-100">
                                    {log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : "---"}
                                </td>
                                <td className="p-3 border-r border-gray-100 font-semibold text-gray-700">
                                    {log.user_full_name || log.user_email || "System"}
                                </td>
                                <td className="p-3 text-center border-r border-gray-100">
                                    <span className={`px-1.5 py-0.5 text-[9px] font-black tracking-tighter rounded border ${log.action_type === 'DELETE' ? 'text-red-600 border-red-200 bg-red-50' :
                                        log.action_type === 'UPDATE' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                            'text-emerald-600 border-emerald-200 bg-emerald-50'
                                        }`}>
                                        {log.action_type}
                                    </span>
                                </td>
                                <td className="p-3 border-r border-gray-100 font-bold text-gray-800">
                                    {log.resource_type}
                                    <span className="text-[10px] text-gray-400 block font-mono font-normal leading-tight">ID: {log.resource_id}</span>
                                </td>
                                <td className="p-3 flex items-center justify-between gap-3 overflow-hidden">
                                    <span className="text-gray-600 truncate italic">{log.description}</span>
                                    <button
                                        onClick={() => setSelectedLog(log)}
                                        className="shrink-0 text-[rgb(0,134,137)] font-black text-[10px] hover:underline uppercase tracking-widest"
                                    >
                                        Inspect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-5xl border border-gray-300 flex flex-col max-h-[90vh]">
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-500">Raw Data Inspection</span>
                            <button onClick={() => setSelectedLog(null)} className="text-2xl hover:text-red-600">&times;</button>
                        </div>
                        <div className="p-4 bg-[#0d1117] grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px] overflow-hidden">
                            <div className="flex flex-col overflow-hidden">
                                <label className="text-slate-500 text-[9px] font-bold mb-2 uppercase border-b border-slate-800 pb-1">Before</label>
                                <pre className="flex-1 p-3 bg-[#161b22] text-red-400 overflow-auto border border-red-900/20 h-[400px]">
                                    {JSON.stringify(selectedLog.old_values, null, 2) || "// No changes"}
                                </pre>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <label className="text-slate-500 text-[9px] font-bold mb-2 uppercase border-b border-slate-800 pb-1">After</label>
                                <pre className="flex-1 p-3 bg-[#161b22] text-emerald-400 overflow-auto border border-emerald-900/20 h-[400px]">
                                    {JSON.stringify(selectedLog.new_values, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 border-t flex justify-end">
                            <button onClick={() => setSelectedLog(null)} className="px-6 py-1.5 bg-gray-800 text-white text-xs font-bold uppercase hover:bg-black transition">Close View</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}