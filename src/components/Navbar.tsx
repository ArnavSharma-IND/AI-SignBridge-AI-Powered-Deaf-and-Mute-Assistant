import React, { useState } from "react";
import { 
  Shield, 
  User, 
  Accessibility, 
  Globe, 
  Award, 
  Sliders, 
  Sun, 
  Moon, 
  Volume2 
} from "lucide-react";
import { AppLanguage, UserAccount } from "../types";

interface NavbarProps {
  currentLang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  largeText: boolean;
  setLargeText: (v: boolean) => void;
  voiceSpeed: number;
  setVoiceSpeed: (v: number) => void;
  user: UserAccount;
  setUser: React.Dispatch<React.SetStateAction<UserAccount>>;
}

export default function Navbar({
  currentLang,
  setLang,
  largeText,
  setLargeText,
  voiceSpeed,
  setVoiceSpeed,
  user,
  setUser
}: NavbarProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authName.trim()) {
      setUser({
        isAuthenticated: true,
        username: authName,
        email: authEmail || `${authName.toLowerCase()}@signbridge.org`,
        streakDays: 4,
        completedLessons: ["A", "B", "1"],
        totalPracticeTimeMins: 42
      });
      setShowAuthModal(false);
    }
  };

  const handleLogout = () => {
    setUser({
      isAuthenticated: false,
      username: "Guest Reader",
      email: "",
      streakDays: 0,
      completedLessons: [],
      totalPracticeTimeMins: 0
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/30 bg-[#0B0F19]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Modern Futuristic Aligned Logo */}
        <div id="nav-logo-container" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/50 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Shield className="h-5 w-5 animate-pulse" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0B0F19]"></span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-xl font-extrabold tracking-wider text-white">
                AI SIGN<span className="text-cyan-400">BRIDGE</span>
              </span>
              <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-cyan-300 ring-1 ring-cyan-500/30">
                PRO v1.2
              </span>
            </div>
            <p className="font-mono text-[9px] tracking-widest text-cyan-400/75">
              SECURE CV TRANSLATOR & POSTURE COACHING
            </p>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Multi-language selector */}
          <div className="relative flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0F172A]/70 px-2 py-1">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <select
              title="Change Language"
              value={currentLang}
              onChange={(e) => setLang(e.target.value as AppLanguage)}
              className="bg-transparent font-mono text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="English" className="bg-[#0b0f19]">EN</option>
              <option value="Hindi" className="bg-[#0b0f19]">हिंदी (HI)</option>
              <option value="Bengali" className="bg-[#0b0f19]">বাংলা (BN)</option>
              <option value="Marathi" className="bg-[#0b0f19]">मराठी (MR)</option>
            </select>
          </div>

          {/* Quick Config Drawer button */}
          <button
            title="Accessibility panel"
            onClick={() => setShowConfig(!showConfig)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
              showConfig 
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400" 
                : "border-slate-800 bg-[#0F172A]/70 text-slate-400 hover:text-white"
            }`}
          >
            <Accessibility className="h-4.5 w-4.5" />
          </button>

          {/* User state indicator */}
          {user.isAuthenticated ? (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-1 pr-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-300">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden text-left md:block">
                <p className="font-sans text-[11px] font-bold text-slate-200">
                  {user.username}
                </p>
                <div className="flex items-center gap-1 font-mono text-[9px] text-cyan-400">
                  <Award className="h-2.5 w-2.5" />
                  <span>Streak: {user.streakDays}d</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 font-mono text-[9px] uppercase tracking-wider text-rose-400 hover:text-rose-300"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              id="login-trigger-btn"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 font-mono text-xs text-cyan-400 transition-all hover:bg-cyan-950/60 hover:shadow-[0_0_10px_rgba(34,211,238,0.25)]"
            >
              <User className="h-3.5 w-3.5" />
              <span>Connect Operator</span>
            </button>
          )}
        </div>
      </div>

      {/* Accessibility Floating Drawer Drawer panel */}
      {showConfig && (
        <div className="border-t border-cyan-500/20 bg-[#070b13] px-6 py-4">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Text Sizing slider */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400">Typography Scale:</span>
                <button
                  onClick={() => setLargeText(!largeText)}
                  className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
                    largeText 
                      ? "bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                      : "bg-[#0f172a] text-slate-300 border border-slate-800"
                  }`}
                >
                  {largeText ? "Extra Large (24px)" : "Normal UI (14px)"}
                </button>
              </div>

              {/* Speech engine synthesis parameters */}
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-cyan-400" />
                <span className="font-mono text-xs text-slate-400">TTS Audio Speed:</span>
                <input
                  type="range"
                  aria-label="Adjust voice speed"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="w-24 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  {voiceSpeed.toFixed(1)}x
                </span>
              </div>
            </div>

            <p className="font-mono text-[9px] text-[#222B43]">
              STATUS MODE: LOCAL CV DECODING STABLE
            </p>
          </div>
        </div>
      )}

      {/* Auth Account Sync Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0E1527] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white"
            >
              ✕
            </button>
            <div className="mb-4">
              <h3 className="font-sans text-lg font-bold text-white uppercase tracking-wider">
                Operator Security Access
              </h3>
              <p className="font-mono text-[11px] text-cyan-400/70 mt-1">
                Establish an encrypted profile session to save translation history and track streak logs.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-1">
                  Operator Username / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Smith"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-400 mb-1">
                  Secure Workspace Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. officer@signbridge.org"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-cyan-500 py-2.5 font-mono text-xs font-bold text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  ESTABLISH ENCRYPTED CONTEXT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
