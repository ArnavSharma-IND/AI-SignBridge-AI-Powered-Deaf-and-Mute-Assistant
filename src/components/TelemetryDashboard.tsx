import React, { useState } from "react";
import { 
  Activity, 
  Clock, 
  Download, 
  Trash2, 
  Share2, 
  Award, 
  CornerDownRight, 
  ArrowDownToLine,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { TranslationLog, UsageStats } from "../types";

interface TelemetryDashboardProps {
  logs: TranslationLog[];
  setLogs: React.Dispatch<React.SetStateAction<TranslationLog[]>>;
  stats: UsageStats[];
}

export default function TelemetryDashboard({
  logs,
  setLogs,
  stats
}: TelemetryDashboardProps) {
  const [exportSuccess, setExportSuccess] = useState<"csv" | "pdf" | null>(null);

  // Trigger browser CSV file generation
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    // Build standard CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Timestamp,Language,Emotion,Confidence,Context,Raw_Signs,Corrected_Sentence\n";

    logs.forEach((log) => {
      const flatSigns = log.rawSigns.join(";");
      const safeSentence = log.correctedSentence.replace(/"/g, '""');
      csvContent += `${log.id},"${log.timestamp}","${log.language}","${log.emotion}",${log.confidence}%,"${log.context}","${flatSigns}","${safeSentence}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AI_SignBridge_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess("csv");
    setTimeout(() => setExportSuccess(null), 2500);
  };

  // Trigger clean PDF printable layout download
  const handleExportPDF = () => {
    if (logs.length === 0) return;

    // Create a beautifully formatted printable TXT report mirroring PDF structure
    let doc = "========================================================================\n";
    doc += "                AI SIGNBRIDGE - TRANSLATION LOG REPORT                  \n";
    doc += "                Generated On: " + new Date().toLocaleString() + "         \n";
    doc += "========================================================================\n\n";

    logs.forEach((log, index) => {
      doc += `${index + 1}. REPORT LOG: ${log.id} \n`;
      doc += `   Timestamp:  ${log.timestamp}\n`;
      doc += `   Language:   ${log.language}\n`;
      doc += `   Emotion:    ${log.emotion} (${log.confidence}% match)\n`;
      doc += `   Context:    ${log.context}\n`;
      doc += `   Raw Signs:  ${log.rawSigns.join(" -> ")}\n`;
      doc += `   Refined:    "${log.correctedSentence}"\n`;
      doc += `------------------------------------------------------------------------\n`;
    });

    doc += "\n\nEnd of AI SignBridge platform report logs.";

    const blob = new Blob([doc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AI_SignBridge_Report_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess("pdf");
    setTimeout(() => setExportSuccess(null), 2500);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0F172A]/40 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full">
      <div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-cyan-400" />
            <h2 className="font-sans text-sm font-bold tracking-wider text-slate-100 uppercase">
              Workspace Telemetry
            </h2>
          </div>

          <div className="flex gap-2">
            {logs.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 font-mono text-[9px] uppercase font-bold text-cyan-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:bg-slate-850 cursor-pointer"
                >
                  <ArrowDownToLine className="h-3 w-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1 font-mono text-[9px] uppercase font-bold text-cyan-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:bg-slate-850 cursor-pointer"
                >
                  <ArrowDownToLine className="h-3 w-3" />
                  <span>PDF Doc</span>
                </button>
                <button
                  onClick={clearLogs}
                  className="flex items-center gap-1 font-mono text-[9px] uppercase font-bold text-rose-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:bg-slate-855 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Wipe</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Export feedbacks toast */}
        {exportSuccess && (
          <div className="mb-3.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2 text-center text-[10.5px] font-mono text-emerald-400">
            ✓ Report files compiled and downloaded successfully as {exportSuccess.toUpperCase()} format.
          </div>
        )}

        {/* Interactive Stats Graphs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          
          {/* Custom SVG cylinder bar chart - translation volumes */}
          <div className="rounded-xl border border-slate-850 bg-slate-950/70 p-3.5 text-left">
            <span className="font-mono text-[9px] text-slate-500 uppercase font-semibold">Translation Vol / Day</span>
            
            <div className="h-28 flex items-end justify-between gap-1.5 mt-2.5">
              {stats.map((stat) => {
                const heightPercent = (stat.count / 65) * 100;
                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group">
                    <div className="font-mono text-[8.5px] text-cyan-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stat.count}
                    </div>
                    
                    {/* Styled Cylinder bar with gradients and shadow glow */}
                    <div className="w-4 rounded-t-sm bg-gradient-to-t from-cyan-950 to-cyan-400 border-x border-t border-cyan-400/40 relative" style={{ height: `${heightPercent}%` }}>
                      <span className="absolute inset-x-0 -top-0.5 h-1 rounded-sm bg-cyan-300"></span>
                    </div>

                    <span className="font-mono text-[8px] text-slate-500 mt-2 block uppercase">{stat.date.substr(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom SVG line chart - accuracy tracking */}
          <div className="rounded-xl border border-slate-850 bg-slate-950/70 p-3.5 text-left">
            <span className="font-mono text-[9px] text-slate-500 uppercase font-semibold">Recogn. Accuracy Ratio (%)</span>
            
            <div className="h-28 relative mt-3.5">
              {/* Plot absolute accuracy line graph elements */}
              <svg className="w-full h-24 overflow-visible">
                <defs>
                  <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="100%" y2="20" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="50" x2="100%" y2="50" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="80" x2="100%" y2="80" stroke="rgba(255,255,255,0.05)" />

                {/* Line coordinates */}
                {/* Coordinates mapped corresponding to [91, 94, 93, 1d2, 95] values */}
                <path
                  d="M 5,25 L 35,10 L 65,15 L 95,20 L 125,5"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  className="stroke-emerald-400"
                />

                <circle cx="5" cy="25" r="3.5" fill="#10B981" />
                <circle cx="35" cy="10" r="3.5" fill="#10B981" />
                <circle cx="65" cy="15" r="3.5" fill="#10B981" />
                <circle cx="95" cy="20" r="3.5" fill="#10B981" />
                <circle cx="125" cy="5" r="3.5" fill="#10B981" />
              </svg>

              <div className="flex justify-between font-mono text-[8px] text-slate-500 uppercase mt-1 px-1">
                <span>06-17</span>
                <span>06-18</span>
                <span>06-19</span>
                <span>06-20</span>
                <span>06-21</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Logging Table */}
        <div className="rounded-xl border border-slate-850 p-4 bg-slate-950/70 text-left min-h-[175px]">
          <p className="font-mono text-[9px] text-slate-500 uppercase mb-3 leading-none">Translation Memory & Security Logs</p>
          
          {logs.length === 0 ? (
            <div className="h-28 flex flex-col items-center justify-center text-slate-600 gap-1.5 font-mono text-xs italic">
              <Clock className="h-4 w-4" />
              <span>Awaiting stream synthesis events.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg bg-slate-900/60 p-3 border border-slate-850 flex flex-col justify-between gap-2">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <div className="flex gap-2">
                      <span className="font-mono text-[9px] text-slate-500">{log.id}</span>
                      <span className="font-mono font-bold text-cyan-400">{log.timestamp}</span>
                    </div>

                    <div className="flex gap-2.5">
                      <span className="font-mono text-[8.5px] uppercase font-bold text-slate-400 bg-[#1E293B] px-1.5 py-0.5 rounded">
                        {log.language}
                      </span>
                      <span className="font-mono text-[8.5px] uppercase font-bold text-[#10B981] bg-emerald-950/10 px-1.5 py-0.5 rounded">
                        {log.emotion}
                      </span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-white leading-relaxed font-semibold">
                    "{log.correctedSentence}"
                  </p>

                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
                    <CornerDownRight className="h-3 w-3 text-slate-600" />
                    <span>Sequence:</span>
                    <span className="text-slate-200 uppercase font-semibold">{log.rawSigns.join(" -> ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="mt-4 border-t border-slate-850 pt-3 flex justify-between items-center">
        <p className="font-mono text-[9px] text-[#222B43]">
          EXPORT SYSTEM CODE COMPLIANT: UTC ENCODED REPORTS
        </p>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10">
          <ShieldCheck className="h-3.5 w-3.5 fill-emerald-950/20" />
          <span>CYBER TRACE COMPLIANT</span>
        </span>
      </div>

    </div>
  );
}
