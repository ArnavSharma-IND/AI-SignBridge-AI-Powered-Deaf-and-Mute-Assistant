import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Play, 
  ArrowRight, 
  Award, 
  Clock, 
  BrainCircuit,
  CornerDownRight
} from "lucide-react";
import { GestureInfo, QuizQuestion, UserAccount } from "../types";
import { ASL_DICTIONARY } from "../utils/dictionary";

interface LearningAcademyProps {
  activeGesture: GestureInfo | null;
  activeConfidence: number;
  user: UserAccount;
  setUser: React.Dispatch<React.SetStateAction<UserAccount>>;
  onPracticeMatchInitiated: (targetId: string | null) => void;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "Q1", targetGesture: "V", hint: "Form a peace sign. Extend index and middle, curled ring and pinky.", visualAslGuide: "✌", standardDurationS: 15 },
  { id: "Q2", targetGesture: "B", hint: "Open flat palm. Five fingers extended and squeezed tight together.", visualAslGuide: "✋", standardDurationS: 15 },
  { id: "Q3", targetGesture: "I", hint: "Fold all fingers down except your pinky pointing straight up.", visualAslGuide: "🤙", standardDurationS: 15 },
  { id: "Q4", targetGesture: "L", hint: "Make an 'L' shape. Fully extend thumb and index at ninety degrees.", visualAslGuide: "🤙", standardDurationS: 15 },
  { id: "Q5", targetGesture: "A", hint: "Make a tight fist, resting your thumb vertical against side.", visualAslGuide: "✊", standardDurationS: 15 }
];

export default function LearningAcademy({
  activeGesture,
  activeConfidence,
  user,
  setUser,
  onPracticeMatchInitiated
}: LearningAcademyProps) {
  const [activeTab, setActiveTab] = useState<"study" | "quiz">("study");
  const [selectedStudyId, setSelectedStudyId] = useState("V");

  // Quiz active states
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizSecondsRemaining, setQuizSecondsRemaining] = useState(15);
  const [quizScore, setQuizScore] = useState(0);
  const [successChecked, setSuccessChecked] = useState(false);
  const [finishedQuizModal, setFinishedQuizModal] = useState(false);

  // Filter dictionary categories
  const studyList = ASL_DICTIONARY.filter(item => ["Alphabet", "Number"].includes(item.category));
  const activeStudyGesture = ASL_DICTIONARY.find(item => item.id === selectedStudyId) || ASL_DICTIONARY[0];

  // Set selected state trigger inside main view to aid canvas target tracing
  const triggerStudyPracticeTarget = (id: string) => {
    setSelectedStudyId(id);
    onPracticeMatchInitiated(id);
  };

  // Turn off tracking pointers when leaving component
  useEffect(() => {
    return () => {
      onPracticeMatchInitiated(null);
    };
  }, []);

  // Timer loop for standard practice quizzes
  useEffect(() => {
    if (!quizActive) return;

    if (quizSecondsRemaining <= 0) {
      // Advance question with 0 credit
      advanceQuestion();
      return;
    }

    const timer = setTimeout(() => {
      setQuizSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [quizActive, quizSecondsRemaining]);

  // Real-time sign validation trigger matching active gesture
  useEffect(() => {
    if (!quizActive || successChecked) return;

    const currentTarget = QUIZ_QUESTIONS[currentQuestionIndex].targetGesture;
    
    // Check if user hand classification matches target and confidence is high
    if (activeGesture && activeGesture.id === currentTarget && activeConfidence > 80) {
      setSuccessChecked(true);
      setQuizScore(s => s + 100);
      triggerSmallDoubleBeep();
      
      // Auto advance or mark streak
      setTimeout(() => {
        advanceQuestion();
      }, 2000);
    }
  }, [quizActive, activeGesture, activeConfidence, currentQuestionIndex, successChecked]);

  const triggerSmallDoubleBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + start);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playBeep(880, 0, 0.1);
      playBeep(1200, 0.12, 0.15);
    } catch (e) {
      // ignore silently
    }
  };

  const startQuiz = () => {
    setQuizActive(true);
    setCurrentQuestionIndex(0);
    setQuizSecondsRemaining(QUIZ_QUESTIONS[0].standardDurationS);
    setQuizScore(0);
    setSuccessChecked(false);
    setFinishedQuizModal(false);
    // Bind practicing Target
    onPracticeMatchInitiated(QUIZ_QUESTIONS[0].targetGesture);
  };

  const advanceQuestion = () => {
    setSuccessChecked(false);
    
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setQuizSecondsRemaining(QUIZ_QUESTIONS[nextIdx].standardDurationS);
      onPracticeMatchInitiated(QUIZ_QUESTIONS[nextIdx].targetGesture);
    } else {
      // Quiz completed!
      setQuizActive(false);
      onPracticeMatchInitiated(null);
      setFinishedQuizModal(true);

      // Save complete lesson XP points to Operator Account Profile
      if (user.username) {
        const updatedLessons = [...new Set([...user.completedLessons, "QUIZ_GRADUATE"])];
        setUser(prev => ({
          ...prev,
          completedLessons: updatedLessons,
          streakDays: prev.streakDays + 1,
          totalPracticeTimeMins: prev.totalPracticeTimeMins + 12
        }));
      }
    }
  };

  const terminateQuizGracefully = () => {
    setQuizActive(false);
    onPracticeMatchInitiated(null);
  };

  const activeQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0F172A]/40 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full">
      <div>
        
        {/* Toggle Headings Row */}
        <div className="flex border-b border-slate-850 pb-2 mb-4 justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("study");
                onPracticeMatchInitiated(selectedStudyId);
              }}
              className={`font-sans text-xs uppercase tracking-wider font-extrabold pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "study" ? "border-cyan-400 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              ASL Dictionary Study
            </button>
            <button
              onClick={() => {
                setActiveTab("quiz");
                onPracticeMatchInitiated(null);
              }}
              className={`font-sans text-xs uppercase tracking-wider font-extrabold pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "quiz" ? "border-cyan-400 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Interactive Quizzes ({QUIZ_QUESTIONS.length})
            </button>
          </div>

          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20">
            <BrainCircuit className="h-3.5 w-3.5 animate-pulse" />
            <span>Interactive Guide</span>
          </span>
        </div>

        {/* STUDY TAB */}
        {activeTab === "study" && (
          <div className="space-y-4">
            
            {/* Quick Grid Selector */}
            <div className="text-left">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-1.5">Sign Vocabulary Catalog</span>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-[120px] overflow-y-auto bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 pr-1">
                {studyList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => triggerStudyPracticeTarget(item.id)}
                    className={`h-7 w-7 flex items-center justify-center font-mono text-[10.5px] font-bold rounded border transition-all ${
                      selectedStudyId === item.id
                        ? "bg-cyan-500 border-cyan-500 text-black shadow-md"
                        : "bg-[#1E293B] border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Gesture Guide Specs */}
            {activeStudyGesture && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-left grid grid-cols-3 gap-3 items-center">
                <div className="col-span-1 text-center bg-[#1E293B]/40 rounded-xl border border-slate-800 py-4 flex flex-col items-center justify-center">
                  <span className="text-4xl block mb-1 relative animate-bounce">{activeStudyGesture.visualSymbol || "✊"}</span>
                  <p className="font-sans text-lg font-black text-cyan-400">{activeStudyGesture.name}</p>
                  <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">{activeStudyGesture.category}</p>
                </div>

                <div className="col-span-2 text-left space-y-2">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-cyan-400/80 leading-none">Anatomical Blueprint:</p>
                  <p className="font-sans text-xs font-semibold text-slate-200 leading-relaxed">
                    {activeStudyGesture.description}
                  </p>

                  <div className="pt-1.5 border-t border-slate-850 space-y-1">
                    <p className="font-mono text-[8px] uppercase tracking-wider text-slate-500 font-bold">Mathematical Target Vector</p>
                    <div className="flex gap-1.5 mt-1 font-mono text-[9px]">
                      {["Thumb", "Index", "Middle", "Ring", "Pinky"].map((finger, fIdx) => (
                        <div key={finger} className="flex flex-col items-center">
                          <span className="text-[7.5px] text-slate-600 font-bold uppercase">{finger.substring(0,3)}</span>
                          <span className={`px-1 py-0.5 mt-0.5 rounded font-bold text-[8.5px] ${
                            activeStudyGesture.fingerState[fIdx] === 1 
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25" 
                              : "bg-slate-900 border border-slate-850 text-slate-600"
                          }`}>
                            {activeStudyGesture.fingerState[fIdx] === 1 ? "UP" : "DN"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick posture comparison dashboard */}
            <div className="rounded-lg bg-slate-950/40 border border-slate-850/60 p-3 text-left">
              <p className="font-mono text-[9.5px] text-slate-400 uppercase tracking-wider">Algorithmic Match Trace</p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex-1">
                  <span className="font-mono text-[8.5px] text-slate-600 block">CURRENT HAND POSING ACCURACY FOR STUDYTARGET KEY "{selectedStudyId}":</span>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-[#10B981] transition-all"
                      style={{ width: `${activeGesture?.id === selectedStudyId ? activeConfidence : 10}%` }}
                    />
                  </div>
                </div>
                <div className="text-right font-mono text-xs mt-2 text-[#10B981] font-extrabold pr-1">
                  {activeGesture?.id === selectedStudyId ? `${activeConfidence}%` : "0% (Diverged)"}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quiz" && (
          <div className="space-y-4 text-center">
            
            {!quizActive && !finishedQuizModal && (
              <div className="py-8 bg-slate-950/60 border border-slate-850/80 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-xl border border-dashed border-cyan-400/50 text-cyan-400 bg-cyan-950/10 flex items-center justify-center text-xl">
                  🎓
                </div>
                <div className="space-y-1 max-w-sm px-4">
                  <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">Initiate Practice Match quiz</h3>
                  <p className="font-sans text-[11px] leading-relaxed text-slate-400">
                    Test your sign language accuracy. You will be prompted to hold 5 gestures in series with an active Y-angle clock!
                  </p>
                </div>

                <button
                  id="quiz-start-btn"
                  onClick={startQuiz}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-mono text-xs font-bold text-black px-5 py-2.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-black" />
                  <span>START EXAM GESTURES</span>
                </button>
              </div>
            )}

            {quizActive && activeQuestion && (
              <div className="space-y-3.5 text-left border border-slate-850 rounded-2xl bg-slate-950/60 p-5 relative overflow-hidden">
                
                {/* Visual score status rows */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-850 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-slate-500 font-bold uppercase">QUESTION:</span>
                    <span className="font-mono text-xs font-bold text-cyan-400">{currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}</span>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span className={`font-mono text-xs font-extrabold ${quizSecondsRemaining < 5 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
                        {quizSecondsRemaining}s
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-400">
                      Score: <span className="text-emerald-400 font-extrabold">{quizScore} XP</span>
                    </div>
                  </div>
                </div>

                {/* Target design goal */}
                <div className="flex gap-4 items-center bg-slate-900/60 border border-slate-850 rounded-xl p-3.5 relative">
                  <div className="h-14 w-14 rounded-2xl border border-cyan-500/20 bg-[#1E293B]/60 text-3xl flex items-center justify-center shadow-lg">
                    {activeQuestion.visualAslGuide}
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-slate-500 uppercase">Make this Sign Shape:</p>
                    <p className="font-sans text-lg font-black text-white uppercase tracking-tight">Active Target: <span className="text-cyan-400">"{activeQuestion.targetGesture}"</span></p>
                  </div>

                  {successChecked && (
                    <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex items-center justify-center gap-2 rounded-xl text-emerald-400 border border-emerald-500/40">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span className="font-sans text-xs font-extrabold uppercase">SIGN VALIDATED (+100 XP)</span>
                    </div>
                  )}
                </div>

                {/* Question Tips / hints */}
                <div className="rounded-lg bg-[#0f172a] p-3 text-xs flex gap-2 border border-slate-800">
                  <BrainCircuit className="h-4.5 w-4.5 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[9px] text-[#A855F7] uppercase block font-semibold">TUTOR STUDY HINT:</span>
                    <p className="font-sans text-slate-300 leading-relaxed text-[11px] font-medium">
                      {activeQuestion.hint}
                    </p>
                  </div>
                </div>

                {/* Active matching trace bar */}
                <div className="rounded-lg bg-black/40 border border-slate-850 p-3">
                  <span className="font-mono text-[8px] text-slate-500 leading-none">CURRENT MATCH FEEDBACK TRACER:</span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      You: "{activeGesture?.name || "NONE"}"
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 transition-all"
                        style={{ width: `${activeGesture?.id === activeQuestion.targetGesture ? activeConfidence : 12}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400 font-extrabold pr-1">
                      {activeGesture?.id === activeQuestion.targetGesture ? `${activeConfidence}%` : "Incor."}
                    </span>
                  </div>
                </div>

                {/* Terminate trigger */}
                <div className="pt-2 text-right">
                  <button
                    onClick={terminateQuizGracefully}
                    className="font-mono text-[9.5px] uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Abort Active Quiz
                  </button>
                </div>

              </div>
            )}

            {/* Finished Quiz Modal */}
            {finishedQuizModal && (
              <div id="quiz-congrats-panel" className="py-7 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-full border border-emerald-500/40 text-emerald-400 bg-emerald-950/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  🏆
                </div>
                <div className="space-y-1 px-4 text-center">
                  <h3 className="font-sans text-sm font-bold text-slate-100 uppercase tracking-widest leading-none">Lesson Exam Graduated!</h3>
                  <p className="font-mono text-xs text-emerald-400 mt-1 font-bold">Total XP Gained: +{quizScore} XP</p>
                  <p className="font-sans text-[11px] leading-relaxed text-slate-400 max-w-xs mt-2 mx-auto">
                    Marvelous performance! All targets have been verified. Your Operator stats and academy logs have been credited.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setFinishedQuizModal(false)}
                    className="rounded-lg border border-slate-800 bg-slate-950 text-slate-300 font-mono text-[10px] px-3.5 py-1.5 hover:text-white"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={startQuiz}
                    className="rounded-lg bg-cyan-400 text-black font-semibold font-mono text-[10px] px-3.5 py-1.5 hover:bg-cyan-300"
                  >
                    Retake Quiz
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      <div className="mt-4 border-t border-slate-850 pt-3">
        <p className="font-mono text-[9px] text-[#222B43] tracking-widest font-bold">
          ACADEMY LESSON SYLLABUS ALIGNMENT: ASL AMERICAN STANDARD
        </p>
      </div>

    </div>
  );
}
