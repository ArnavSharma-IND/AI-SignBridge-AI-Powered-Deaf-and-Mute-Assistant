import React, { useState, useEffect } from "react";
import { 
  Keyboard, 
  Trash2, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  Plus, 
  CheckCircle,
  Clock,
  Briefcase,
  AlertOctagon,
  Copy
} from "lucide-react";
import { GestureInfo, TranslationLog, AppLanguage, EmotionProfile } from "../types";
import { LOCALIZATION } from "../utils/dictionary";

interface TranslatePanelProps {
  activeGesture: GestureInfo | null;
  activeConfidence: number;
  currentLang: AppLanguage;
  voiceSpeed: number;
  onNewTranslationSaved: (log: TranslationLog) => void;
  emotionProfile: EmotionProfile;
}

export default function TranslatePanel({
  activeGesture,
  activeConfidence,
  currentLang,
  voiceSpeed,
  onNewTranslationSaved,
  emotionProfile
}: TranslatePanelProps) {
  const [gestureQueue, setGestureQueue] = useState<string[]>(["HELLO", "WATER", "PLEASE"]);
  const [correctedSentence, setCorrectedSentence] = useState<string>("");
  const [meaningExplanation, setMeaningExplanation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [categoryContext, setCategoryContext] = useState("Hospital / Clinic");
  const [hasCopied, setHasCopied] = useState(false);

  // Auto-accumulator states
  const [stableCount, setStableCount] = useState(0);
  const [lastSeenGesture, setLastSeenGesture] = useState<string>("");

  // Auto-accrue stable gestures to mock live stream sentence building
  useEffect(() => {
    if (!activeGesture) return;

    if (activeGesture.id === lastSeenGesture) {
      // If same sign held for 25 continuous cycles (~1.25s) with high accuracy
      if (activeConfidence > 80) {
        setStableCount(prev => {
          if (prev >= 25) {
            // Check if already the last item in queue to avoid duplicates
            if (gestureQueue[gestureQueue.length - 1] !== activeGesture.id) {
              setGestureQueue(q => [...q, activeGesture.id]);
              triggerSmallChirp();
            }
            return 0; // reset
          }
          return prev + 1;
        });
      }
    } else {
      setLastSeenGesture(activeGesture.id);
      setStableCount(0);
    }
  }, [activeGesture, activeConfidence, lastSeenGesture, gestureQueue]);

  const triggerSmallChirp = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(650, audioCtx.currentTime); 
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      // ignore audio context failures
    }
  };

  const manualAppend = () => {
    if (activeGesture) {
      setGestureQueue(q => [...q, activeGesture.id]);
      triggerSmallChirp();
    }
  };

  const removeLastWord = () => {
    setGestureQueue(q => q.slice(0, -1));
  };

  const clearQueue = () => {
    setGestureQueue([]);
    setCorrectedSentence("");
    setMeaningExplanation("");
  };

  const copyToClipboard = () => {
    const textToCopy = correctedSentence || gestureQueue.join(" ");
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  // Text to Speech logic mapped to dynamic system voices or language profiles
  const handleTextToSpeech = () => {
    const textToSpeak = correctedSentence || gestureQueue.join(" ") || "No text available";
    
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // stop current
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = voiceSpeed;

      // Select localized voice profiles matching language selection
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (currentLang === "Hindi") {
        selectedVoice = voices.find(v => v.lang.includes("hi-IN") || v.lang.includes("hi_IN"));
      } else if (currentLang === "Bengali") {
        selectedVoice = voices.find(v => v.lang.includes("bn-IN") || v.lang.includes("bn-BD"));
      } else if (currentLang === "Marathi") {
        selectedVoice = voices.find(v => v.lang.includes("mr-IN") || v.lang.includes("mr_IN"));
      }

      // Default English / safety matching
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB")) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Call Express proxy endpoint `/api/translate` for Gemini Grammar refinement
  const translateWithAI = async () => {
    if (gestureQueue.length === 0) return;
    setAiLoading(true);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawSequence: gestureQueue,
          context: categoryContext,
          language: currentLang
        })
      });

      const data = await response.json();
      setCorrectedSentence(data.correctedText || gestureQueue.join(" "));
      setMeaningExplanation(data.meaningExplanation || "Computed on-device literal signs sequence");

      // Save to usage analytics ledger
      const newLog: TranslationLog = {
        id: "TX_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: new Date().toLocaleTimeString(),
        rawSigns: [...gestureQueue],
        correctedSentence: data.correctedText || gestureQueue.join(" "),
        language: currentLang,
        emotion: emotionProfile.name,
        confidence: activeConfidence,
        context: categoryContext,
        isEmergency: gestureQueue.some(w => ["HELP", "SOS", "DANGER"].includes(w))
      };

      onNewTranslationSaved(newLog);

      // Auto play speech upon successful AI refinement
      setTimeout(() => {
        if ("speechSynthesis" in window) {
          const refinedUtterance = new SpeechSynthesisUtterance(data.correctedText);
          refinedUtterance.rate = voiceSpeed;
          window.speechSynthesis.speak(refinedUtterance);
        }
      }, 400);

    } catch (e) {
      console.error("Gemini context translation error:", e);
      setCorrectedSentence(gestureQueue.join(" "));
    } finally {
      setAiLoading(false);
    }
  };

  const localized = LOCALIZATION[currentLang] || LOCALIZATION.English;

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0F172A]/40 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full">
      <div>
        
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
            <h2 className="font-sans text-sm font-bold tracking-wider text-slate-100 uppercase">
              {localized.sentenceBuilder}
            </h2>
          </div>

          <div className="flex gap-1">
            <button
              onClick={manualAppend}
              disabled={!activeGesture}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold text-[#0B0F19] transition-all ${
                activeGesture 
                  ? "bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)] cursor-pointer" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Plus className="h-3 w-3" />
              <span>Append Sign</span>
            </button>
          </div>
        </div>

        {/* Ambient Emotion / Context profiles */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg bg-slate-950/70 border border-slate-850 p-2.5 text-left">
            <p className="font-mono text-[9px] text-slate-500 uppercase">{localized.emotion}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{emotionProfile.marker}</span>
              <span className="font-sans text-xs font-extrabold" style={{ color: emotionProfile.color }}>
                {emotionProfile.name}
              </span>
              <span className="font-mono text-[9px] text-slate-400">({emotionProfile.score}%)</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/70 border border-slate-850 p-2.5 text-left">
            <p className="font-mono text-[9px] text-slate-500 uppercase">Context Intent Selector</p>
            <select
              aria-label="Filter context template"
              value={categoryContext}
              onChange={(e) => setCategoryContext(e.target.value)}
              className="bg-transparent font-sans text-xs font-bold text-cyan-400 outline-none w-full mt-1 cursor-pointer"
            >
              <option value="General Conversation" className="bg-[#0b0f19]">General Chat</option>
              <option value="Hospital / Medical Emergency" className="bg-[#0b0f19]">Medical Emergency</option>
              <option value="Police / Safety Check" className="bg-[#0b0f19]">Police Safety Check</option>
              <option value="Restaurant Dining" className="bg-[#0b0f19]">Restaurant Dining</option>
              <option value="Airport Transit" className="bg-[#0b0f19]">Airport Transit</option>
            </select>
          </div>
        </div>

        {/* Raw Signs Queue Display with micro animations */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 mb-4 text-left min-h-[105px]">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-2">RAW GESTURED PHRASE STREAM</p>
          {gestureQueue.length === 0 ? (
            <p className="font-mono text-xs text-slate-600 italic py-3">
              Waiting for signs. Perform and hold stable gestures in camera view.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 items-center">
              {gestureQueue.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-[#1E293B] border border-cyan-500/15 py-1 px-2 rounded-lg">
                  <span className="font-mono text-[11px] font-bold text-cyan-300">{item}</span>
                  {idx < gestureQueue.length - 1 && (
                    <ArrowRight className="h-2.5 w-2.5 text-slate-600 block" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Accumulator visual tracker */}
          {activeGesture && lastSeenGesture === activeGesture.id && stableCount > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="font-mono text-[8px] text-slate-500">HOLDING "{activeGesture.name}" TO AUTO-APPEND:</span>
              <div className="w-16 h-1 rounded bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-75"
                  style={{ width: `${(stableCount / 25) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* AI Correction Panel Output */}
        <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 to-purple-950/10 p-4 mb-4 text-left min-h-[140px] relative">
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={copyToClipboard}
              disabled={!correctedSentence && gestureQueue.length === 0}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Copy translation"
            >
              {hasCopied ? <span className="font-mono text-[8px] text-emerald-400">Copied!</span> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-1 text-cyan-400">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Gemini AI Correction & Semantic Synthesis</span>
          </div>

          {aiLoading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-3">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-500/40"></span>
              </span>
              <p className="font-mono text-[10px] text-cyan-400 animate-pulse">RECONSTRUCTING ASL INTENT COGNITIVELY...</p>
            </div>
          ) : correctedSentence ? (
            <div className="space-y-2 mt-2">
              <p className="font-sans text-sm font-extrabold text-white tracking-wide pr-8">
                "{correctedSentence}"
              </p>
              {meaningExplanation && (
                <div className="border-t border-slate-850 pt-2.5 flex gap-1 text-[10.5px]">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <p className="font-mono text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-bold">Analysis:</span> {meaningExplanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 flex items-center justify-center gap-1 text-slate-500 font-mono text-xs italic">
              <Clock className="h-3 w-3" />
              <span>Click "Convert signs" to run Gemini translation.</span>
            </div>
          )}
        </div>

      </div>

      {/* Control buttons footer */}
      <div className="grid grid-cols-4 gap-2 border-t border-slate-850 pt-3">
        <button
          onClick={clearQueue}
          disabled={gestureQueue.length === 0}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/30 text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Clear queue"
        >
          <Trash2 className="h-4 w-4" />
          <span className="font-mono text-[8px] mt-1">Clear</span>
        </button>

        <button
          onClick={removeLastWord}
          disabled={gestureQueue.length === 0}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/30 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Backspace"
        >
          <Keyboard className="h-4 w-4" />
          <span className="font-mono text-[8px] mt-1">Pop Sign</span>
        </button>

        <button
          onClick={handleTextToSpeech}
          disabled={gestureQueue.length === 0}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/30 text-cyan-400 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Speak text"
        >
          <Volume2 className="h-4 w-4" />
          <span className="font-mono text-[8px] mt-1">Audio TTS</span>
        </button>

        <button
          id="ai-render-button"
          onClick={translateWithAI}
          disabled={gestureQueue.length === 0 || aiLoading}
          className="col-span-1 flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/30 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Convert signs"
        >
          <Sparkles className="h-4 w-4" />
          <span className="font-mono text-[8px] mt-1">AI Correct</span>
        </button>
      </div>

    </div>
  );
}
