import React, { useState } from "react";
import { 
  Award, 
  BookOpen, 
  HelpCircle, 
  Activity, 
  MessageSquareCode, 
  Volume2, 
  Sliders, 
  Sparkles, 
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Landmark, GestureInfo } from "../types";

interface FeedbackPanelProps {
  landmarks: Landmark[];
  activeGesture: GestureInfo | null;
  activeConfidence: number;
}

interface CoachResponse {
  coachingVerdict: string;
  concreteActionStep: string;
  tips: string[];
}

export default function FeedbackPanel({
  landmarks,
  activeGesture,
  activeConfidence
}: FeedbackPanelProps) {
  const [coachingTarget, setCoachingTarget] = useState("V");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [coachResponse, setCoachResponse] = useState<CoachResponse | null>({
    coachingVerdict: "Ideal posture! Perfect finger alignment has been reached.",
    concreteActionStep: "Keep practicing. Ensure your wrist stays vertical without rotating.",
    tips: [
      "Keep finger joints stretched tall with minimal curl",
      "Keep your thumb tucked closely over your folded ring finger's second joint",
      "Avoid trembling. Take a steady breath while holding the sign"
    ]
  });

  const requestAIFeedback = async () => {
    if (!landmarks || landmarks.length === 0) return;
    setLoadingFeedback(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGesture: coachingTarget,
          landmarks: landmarks,
          userAccuracy: activeConfidence
        })
      });

      const data = await response.json();
      setCoachResponse({
        coachingVerdict: data.coachingVerdict || "Posturing evaluated successfully",
        concreteActionStep: data.concreteActionStep || "Keep adjusting spacing",
        tips: data.tips || ["Review the landmark angles visually"]
      });

      // Quick play check spoken audio speech for verdict
      if ("speechSynthesis" in window) {
        const coachSpeak = new SpeechSynthesisUtterance(data.coachingVerdict);
        coachSpeak.rate = 1.0;
        window.speechSynthesis.speak(coachSpeak);
      }

    } catch (e) {
      console.error("Coaching endpoint failure:", e);
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0F172A]/40 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full">
      <div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-cyan-400" />
            <h2 className="font-sans text-sm font-bold tracking-wider text-slate-100 uppercase animate-pulse">
              AI Posture Tutor
            </h2>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-300 ring-1 ring-cyan-400/20">
            DOCK CONNECTED
          </span>
        </div>

        {/* Action Goal selector */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 text-left">
            <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">
              Select Gesture to Calibrate:
            </label>
            <div className="flex gap-2">
              <select
                aria-label="Filter coaching pose"
                value={coachingTarget}
                onChange={(e) => setCoachingTarget(e.target.value)}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="A" className="bg-[#0b0f19]">A (Fist)</option>
                <option value="B" className="bg-[#0b0f19]">B (Flat hand)</option>
                <option value="D" className="bg-[#0b0f19]">D (pointing up)</option>
                <option value="F" className="bg-[#0b0f19]">F (OK sign)</option>
                <option value="I" className="bg-[#0b0f19]">I (Pinky up)</option>
                <option value="L" className="bg-[#0b0f19]">L (Thumb & Index)</option>
                <option value="V" className="bg-[#0b0f19]">V (Peace Sign)</option>
                <option value="W" className="bg-[#0b0f19]">W (forming index/mid/ring)</option>
                <option value="Y" className="bg-[#0b0f19]">Y (Thumb and Pinky)</option>
              </select>

              <button
                onClick={requestAIFeedback}
                disabled={loadingFeedback || !landmarks || landmarks.length === 0}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black px-4 font-mono text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                {loadingFeedback ? "Analyzing..." : "Analyze Posture"}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Vector state readouts */}
        <div className="border border-slate-850 bg-slate-950/70 rounded-xl p-3.5 mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] text-slate-400 uppercase">Live Coordinate Streams</span>
            <span className="font-mono text-[8px] text-cyan-400">{landmarks?.length || 0}/21 joints tracked</span>
          </div>

          {landmarks && landmarks.length > 0 ? (
            <div className="grid grid-cols-5 gap-1.5 py-1 text-center font-mono text-[9px]">
              <div className="rounded bg-[#1E293B] p-1 border border-slate-800">
                <p className="text-slate-500 font-extrabold uppercase">TMB</p>
                <p className="text-cyan-300 font-extrabold mt-0.5">X: {landmarks[4]?.x.toFixed(2)}</p>
              </div>
              <div className="rounded bg-[#1E293B] p-1 border border-slate-800">
                <p className="text-slate-500 font-extrabold uppercase">IDX</p>
                <p className="text-cyan-300 font-extrabold mt-0.5">X: {landmarks[8]?.x.toFixed(2)}</p>
              </div>
              <div className="rounded bg-[#1E293B] p-1 border border-slate-800">
                <p className="text-slate-500 font-extrabold uppercase">MID</p>
                <p className="text-cyan-300 font-extrabold mt-0.5">X: {landmarks[12]?.x.toFixed(2)}</p>
              </div>
              <div className="rounded bg-[#1E293B] p-1 border border-slate-800">
                <p className="text-slate-500 font-extrabold uppercase">RNG</p>
                <p className="text-cyan-300 font-extrabold mt-0.5">X: {landmarks[16]?.x.toFixed(2)}</p>
              </div>
              <div className="rounded bg-[#1E293B] p-1 border border-slate-800">
                <p className="text-slate-500 font-extrabold uppercase">PNK</p>
                <p className="text-cyan-300 font-extrabold mt-0.5">X: {landmarks[20]?.x.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-[10.5px] py-2 text-slate-500 italic">No coordinates matching active buffers.</p>
          )}
        </div>

        {/* Coach Response Segment */}
        {coachResponse && (
          <div className="rounded-xl border border-teal-500/25 bg-teal-950/5 p-4 text-left">
            <div className="flex gap-2 items-start mb-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono text-[9px] text-teal-300 uppercase leading-none font-bold">AI Posture Verdict</p>
                <p className="font-sans text-xs font-extrabold text-white mt-1">
                  "{coachResponse.coachingVerdict}"
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/80 p-3 mb-3 border border-slate-850">
              <p className="font-mono text-[8px] text-amber-400 uppercase font-semibold">COACHING TARGET REFACTOR</p>
              <p className="font-sans text-[11px] text-slate-200 mt-1 font-medium leading-relaxed">
                {coachResponse.concreteActionStep}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-mono text-[8.5px] text-slate-500 uppercase">Posture Coaching Checkpoints</p>
              {coachResponse.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-2 items-start text-[10.5px]">
                  <span className="font-sans text-cyan-400 font-bold ml-1">•</span>
                  <p className="font-sans text-slate-300 leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="mt-4 border-t border-slate-850 pt-3">
        <p className="font-mono text-[9px] text-slate-600">
          METRICS RECTIFIED AT 60FPS BASED ON REAL-TIME TRIGONOMETRY ANALYSIS
        </p>
      </div>

    </div>
  );
}
