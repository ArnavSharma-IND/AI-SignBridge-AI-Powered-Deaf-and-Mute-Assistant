import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Sparkles, 
  Volume2, 
  BrainCircuit, 
  Activity, 
  AlertTriangle, 
  BellRing,
  Award,
  BookOpen
} from "lucide-react";
import Navbar from "./components/Navbar";
import CameraView from "./components/CameraView";
import TranslatePanel from "./components/TranslatePanel";
import FeedbackPanel from "./components/FeedbackPanel";
import LearningAcademy from "./components/LearningAcademy";
import TelemetryDashboard from "./components/TelemetryDashboard";
import { GestureInfo, Landmark, TranslationLog, UserAccount, UsageStats, EmotionProfile } from "./types";

const INITIAL_STATS: UsageStats[] = [
  { date: "2026-06-17", count: 15, accuracy: 91 },
  { date: "2026-06-18", count: 24, accuracy: 94 },
  { date: "2026-06-19", count: 38, accuracy: 93 },
  { date: "2026-06-20", count: 45, accuracy: 92 },
  { date: "2026-06-21", count: 56, accuracy: 95 }
];

export default function App() {
  // Localization properties
  const [currentLang, setLang] = useState<"English" | "Hindi" | "Bengali" | "Marathi">("English");
  
  // Accessibility scales
  const [largeText, setLargeText] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  // Authenticated Profile configuration
  const [user, setUser] = useState<UserAccount>({
    isAuthenticated: false,
    username: "Guest Reader",
    email: "",
    streakDays: 0,
    completedLessons: [],
    totalPracticeTimeMins: 0
  });

  // Track coordinates of landmarks
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [activeGesture, setActiveGesture] = useState<GestureInfo | null>(null);
  const [activeConfidence, setActiveConfidence] = useState(0);

  // Practice matches targeting specific shapes
  const [selectedPracticeTarget, setSelectedPracticeTarget] = useState<string | null>(null);

  // Real-time translation logs
  const [logs, setLogs] = useState<TranslationLog[]>([
    {
      id: "TX_INIT",
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
      rawSigns: ["HELLO", "WATER"],
      correctedSentence: "Hello, I require a glass of water.",
      language: "English",
      emotion: "Calm",
      confidence: 96,
      context: "General Conversation"
    }
  ]);

  // Emergency triggers
  const [alarmActive, setAlarmActive] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: "34.0522° N", lon: "-118.2437° W" });

  // Main UI Tab Router
  const [activeTab, setActiveTab] = useState<"translate" | "feedback" | "academy" | "telemetry">("translate");

  // Track motion / hand speed emotion indicators
  const [emotionProfile, setEmotionProfile] = useState<EmotionProfile>({
    name: "Calm",
    score: 95,
    color: "#06B6D4",
    marker: "🧘"
  });

  // Automatically update estimated Hand emotion speed profiles
  useEffect(() => {
    if (!activeGesture) return;

    if (activeGesture.category === "Emergency") {
      setEmotionProfile({
        name: "Distressed",
        score: 91,
        color: "#F43F5E",
        marker: "⚠️"
      });

      // SOS/Emergency specific triggers
      if (activeConfidence > 85 && ["HELP", "SOS", "DANGER"].includes(activeGesture.id)) {
        setAlarmActive(true);
        triggerAlarmAudio();
      }
    } else if (activeGesture.id === "HELLO") {
      setEmotionProfile({
        name: "Happy",
        score: 94,
        color: "#10B981",
        marker: "😊"
      });
    } else if (activeGesture.id === "NO") {
      setEmotionProfile({
        name: "Angry",
        score: 82,
        color: "#EF4444",
        marker: "😤"
      });
    } else {
      setEmotionProfile({
        name: "Calm",
        score: 92,
        color: "#06B6D4",
        marker: "🧘"
      });
    }
  }, [activeGesture, activeConfidence]);

  const triggerAlarmAudio = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      // Siren wobble frequency
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // ignore context bugs
    }
  };

  const handleNewTranslationSaved = (log: TranslationLog) => {
    setLogs(prev => [log, ...prev]);
  };

  const handlePracticeTargetTrigger = (targetId: string | null) => {
    setSelectedPracticeTarget(targetId);
  };

  return (
    <div className={`min-h-screen bg-[#070B13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black ${largeText ? "text-lg" : "text-sm"}`}>
      
      {/* Platform Nav Bar */}
      <Navbar 
        currentLang={currentLang}
        setLang={setLang}
        largeText={largeText}
        setLargeText={setLargeText}
        voiceSpeed={voiceSpeed}
        setVoiceSpeed={setVoiceSpeed}
        user={user}
        setUser={setUser}
      />

      {/* Emergency Alert Pulsing Screen overlay */}
      {alarmActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/85 backdrop-blur-md animate-pulse border-8 border-rose-500">
          <div className="w-full max-w-xl rounded-2xl border border-rose-500 bg-black p-8 text-center shadow-2xl space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl animate-bounce">
              <BellRing className="h-8 w-8 text-rose-500" />
            </div>

            <div className="space-y-2">
              <h2 className="font-sans text-2xl font-black text-rose-300 tracking-wider">
                🚨 EMERGENCY GESTURE ACTIVE
              </h2>
              <p className="font-mono text-xs text-rose-400">
                W-ANGLE MOTION SIGN HAS BEEN ENCRYPTED AND SENT TO EMERGENCY BEACON AGENTS.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-left font-mono text-xs leading-relaxed space-y-1.5 text-rose-200">
              <p className="font-bold text-white uppercase font-mono">📡 Broadcast Beacon telemetry details:</p>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div>
                  <span className="text-rose-400 block text-[9px]">MOCK LATITUDE GPS:</span>
                  <span className="text-white font-bold">{gpsCoordinates.lat}</span>
                </div>
                <div>
                  <span className="text-rose-400 block text-[9px]">MOCK LONGITUDE GPS:</span>
                  <span className="text-white font-bold">{gpsCoordinates.lon}</span>
                </div>
              </div>
              <p className="border-t border-rose-500/20 pt-2 text-[10.5px]">
                Status: Local emergency responder centers have locked location and are currently in transit. Keep calm and hold position.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setAlarmActive(false)}
                className="w-full rounded-xl bg-rose-500 font-sans text-xs font-bold text-black py-3 hover:bg-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
              >
                DISENGAGE SIREN / CLEAR ALARM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Core Platform Scaffold */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Webcam capture / interactive Sandbox glove) */}
        <div className="lg:col-span-6 flex flex-col justify-stretch">
          <CameraView 
            onGestureDetected={(gesture, confidence, coords) => {
              setActiveGesture(gesture);
              setActiveConfidence(confidence);
              setLandmarks(coords);
            }}
            activeGesture={activeGesture}
            activeConfidence={activeConfidence}
            selectedPracticeTarget={selectedPracticeTarget}
          />
        </div>

        {/* Right Column (Control Centers / Workspace Switchers) */}
        <div id="control-workspace-column" className="lg:col-span-6 flex flex-col justify-stretch min-h-[500px]">
          
          {/* Workspaces Tabs Selection buttons */}
          <div className="grid grid-cols-4 gap-1.5 mb-4 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("translate")}
              className={`py-2 px-1 rounded-lg text-center font-sans font-bold text-xs tracking-wide transition-all ${
                activeTab === "translate" 
                  ? "bg-cyan-500 text-black shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Workbench
            </button>
            <button
              id="tab-feedback-btn"
              onClick={() => setActiveTab("feedback")}
              className={`py-2 px-1 rounded-lg text-center font-sans font-bold text-xs tracking-wide transition-all ${
                activeTab === "feedback" 
                  ? "bg-cyan-500 text-black shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Tutor
            </button>
            <button
              onClick={() => setActiveTab("academy")}
              className={`py-2 px-1 rounded-lg text-center font-sans font-bold text-xs tracking-wide transition-all ${
                activeTab === "academy" 
                  ? "bg-cyan-500 text-black shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Academy
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`py-2 px-1 rounded-lg text-center font-sans font-bold text-xs tracking-wide transition-all ${
                activeTab === "telemetry" 
                  ? "bg-cyan-500 text-black shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Telemetry
            </button>
          </div>

          {/* Render Active Panels on dynamic state router */}
          <div className="flex-1">
            {activeTab === "translate" && (
              <TranslatePanel 
                activeGesture={activeGesture}
                activeConfidence={activeConfidence}
                currentLang={currentLang}
                voiceSpeed={voiceSpeed}
                onNewTranslationSaved={handleNewTranslationSaved}
                emotionProfile={emotionProfile}
              />
            )}

            {activeTab === "feedback" && (
              <FeedbackPanel 
                landmarks={landmarks}
                activeGesture={activeGesture}
                activeConfidence={activeConfidence}
              />
            )}

            {activeTab === "academy" && (
              <LearningAcademy 
                activeGesture={activeGesture}
                activeConfidence={activeConfidence}
                user={user}
                setUser={setUser}
                onPracticeMatchInitiated={handlePracticeTargetTrigger}
              />
            )}

            {activeTab === "telemetry" && (
              <TelemetryDashboard 
                logs={logs}
                setLogs={setLogs}
                stats={INITIAL_STATS}
              />
            )}
          </div>

        </div>

      </main>

      {/* Footer copyright status bar inline */}
      <footer className="border-t border-slate-900 bg-[#05080F] py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 font-mono text-[10px] text-slate-500">
          <p>© 2026 AI SignBridge Platform. Made with modern React + FastAPI architecture specifications.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Security Protocol TLS 1.3</span>
            <span className="hover:text-slate-300 cursor-pointer">WASM Acceleration: Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
