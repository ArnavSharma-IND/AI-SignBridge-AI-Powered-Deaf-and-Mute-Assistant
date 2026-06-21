import React, { useEffect, useRef, useState } from "react";
import { 
  Camera, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  SlidersHorizontal,
  FolderSync
} from "lucide-react";
import { Landmark, GestureInfo } from "../types";
import { classifyGesture, generateSimulatedLandmarks, analyzeFingerStates, ASL_DICTIONARY } from "../utils/dictionary";

interface CameraViewProps {
  onGestureDetected: (gesture: GestureInfo, confidence: number, landmarks: Landmark[]) => void;
  activeGesture: GestureInfo | null;
  activeConfidence: number;
  selectedPracticeTarget: string | null;  // For guided quiz practice matching
}

export default function CameraView({
  onGestureDetected,
  activeGesture,
  activeConfidence,
  selectedPracticeTarget
}: CameraViewProps) {
  const [useSimulation, setUseSimulation] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [mediaPipeStatus, setMediaPipeStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [simulatedSelectedId, setSimulatedSelectedId] = useState<string>("B");

  // Simulated control state for manual manipulation
  const [simThumb, setSimThumb] = useState(true);
  const [simIndex, setSimIndex] = useState(true);
  const [simMiddle, setSimMiddle] = useState(true);
  const [simRing, setSimRing] = useState(true);
  const [simPinky, setSimPinky] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);
  const mediaPipeCamera = useRef<any>(null);

  // Load simulated landmarks based on state
  useEffect(() => {
    if (!useSimulation) return;

    let timePhase = 0;
    const interval = setInterval(() => {
      timePhase += 0.05;
      
      // Determine what finger state we are using
      // Either we simulate a predefined ASL dictionary gesture
      // OR we let the user manually toggle fingers (custom sandbox)
      let currentCoords: Landmark[];
      if (simulatedSelectedId === "CUSTOM") {
        // Build Custom Coordinates
        const mockGesture: GestureInfo = {
          id: "CUSTOM",
          name: "SANDBOX GLOVE",
          category: "Alphabet",
          fingerState: [simThumb ? 1 : 0, simIndex ? 1 : 0, simMiddle ? 1 : 0, simRing ? 1 : 0, simPinky ? 1 : 0],
          description: "Manually manipulated gesture sandbox"
        };
        currentCoords = generateCustomSimLandmarks(mockGesture, timePhase);
      } else {
        currentCoords = generateSimulatedLandmarks(simulatedSelectedId, timePhase);
      }

      // Run local geometric classification on coordinates
      const classification = classifyGesture(currentCoords);
      onGestureDetected(classification.gesture, classification.confidence, currentCoords);

      // Render onto canvas
      drawLandmarks(currentCoords);

    }, 50);

    return () => clearInterval(interval);
  }, [useSimulation, simulatedSelectedId, simThumb, simIndex, simMiddle, simRing, simPinky]);

  // Load MediaPipe Hands dynamically from CDN
  const initWebcamMediaPipe = async () => {
    setCameraLoading(true);
    setCameraBlocked(false);
    setMediaPipeStatus("loading");

    try {
      // 1. Check if mediaDevices is allowed/supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Navigator mediaDevices camera not supported in this frame environment");
      }

      // 2. Load external script logic elegantly
      if (!(window as any).Hands) {
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      }

      setMediaPipeStatus("loaded");

      // 3. Initiate camera getUserMedia stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // 4. Configure MediaPipe Hands framework
      const HandsClass = (window as any).Hands;
      const CameraClass = (window as any).Camera;

      if (!HandsClass || !CameraClass) {
        throw new Error("MediaPipe script loaded but window objects not initiated");
      }

      const hands = new HandsClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });

      hands.onResults((results: any) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // Clear and draw image frame
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (videoRef.current) {
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const rawLandmarks: Landmark[] = results.multiHandLandmarks[0];
          // Scale from MediaPipe normalized space inside canvas boundary
          const mappedLandmarks = rawLandmarks.map(p => ({
            x: p.x,
            y: p.y,
            z: p.z
          }));

          // Send results
          const classification = classifyGesture(mappedLandmarks);
          onGestureDetected(classification.gesture, classification.confidence, mappedLandmarks);

          // Draw hand landmarks
          drawRawLandmarksOnCanvas(ctx, rawLandmarks);
        } else {
          // No hand detected but camera is live, keep draw cycle
        }
      });

      const camera = new CameraClass(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      mediaPipeCamera.current = camera;
      await camera.start();
      setUseSimulation(false);
      setCameraLoading(false);

    } catch (err: any) {
      console.error("Camera initialisation failure:", err);
      setCameraBlocked(true);
      setCameraLoading(false);
      setMediaPipeStatus("error");
      // Turn back on simulation mode so user has full functionality
      setUseSimulation(true);
    }
  };

  const stopWebcamStream = () => {
    if (mediaPipeCamera.current) {
      mediaPipeCamera.current.stop();
      mediaPipeCamera.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseSimulation(true);
  };

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.append(script);
    });
  };

  // Canvas drawing routine for Simulated Coordinates
  const drawLandmarks = (coords: Landmark[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark cyber grid canvas backdrop (simulated camera is in interactive black glass space)
    ctx.fillStyle = "#0A0D1A";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let j = 0; j < h; j += 30) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.stroke();
    }

    // Connectors array
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Knuckle row
    ];

    // Draw lines with custom neon cyberpunk gradient
    ctx.lineWidth = 3;
    connections.forEach(([s, e]) => {
      const ps = coords[s];
      const pe = coords[e];
      if (!ps || !pe) return;

      const grad = ctx.createLinearGradient(ps.x * w, ps.y * h, pe.x * w, pe.y * h);
      grad.addColorStop(0, "rgba(6, 182, 212, 0.8)"); // Neon cyan
      grad.addColorStop(1, "rgba(52, 211, 153, 0.8)"); // Emerald green

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ps.x * w, ps.y * h);
      ctx.lineTo(pe.x * w, pe.y * h);
      ctx.stroke();
    });

    // Draw circular nodes
    coords.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20 ? 6 : 4, 0, 2 * Math.PI);
      
      if (idx === 0) {
        ctx.fillStyle = "#A855F7"; // Purple root wrist
      } else if ([4, 8, 12, 16, 20].includes(idx)) {
        ctx.fillStyle = "#22D3EE"; // Bright cyan tips
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#06B6D4";
      } else {
        ctx.fillStyle = "#34D399"; // Green skeleton joints
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    });
    ctx.shadowBlur = 0; // reset
  };

  // Draw real MediaPipe detected coordinates
  const drawRawLandmarksOnCanvas = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    const canvas = canvasRef.current!;
    const w = canvas.width;
    const h = canvas.height;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20],
      [5, 9], [9, 13], [13, 17]
    ];

    // Connectors
    ctx.lineWidth = 3;
    connections.forEach(([s, e]) => {
      const ps = landmarks[s];
      const pe = landmarks[e];
      if (ps && pe) {
        ctx.strokeStyle = "rgba(34, 211, 238, 0.9)";
        ctx.beginPath();
        ctx.moveTo(ps.x * w, ps.y * h);
        ctx.lineTo(pe.x * w, pe.y * h);
        ctx.stroke();
      }
    });

    // Nodes
    landmarks.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 5, 0, 2 * Math.PI);
      ctx.fillStyle = [4, 8, 12, 16, 20].includes(idx) ? "#F43F5E" : "#10B981"; // Target red tips vs green joints
      ctx.fill();
    });
  };

  // Sandbox slider to coordinate simulator math
  const generateCustomSimLandmarks = (mockG: GestureInfo, timePhase: number): Landmark[] => {
    const states = mockG.fingerState;
    const landmarks: Landmark[] = [];
    
    // Wrist joint base
    landmarks.push({ x: 0.5, y: 0.76, z: 0 });

    const noise = () => Math.sin(timePhase * 2.5) * 0.005;

    // Thumb Point 1,2,3,4
    const tUp = states[0] === 1;
    landmarks.push({ x: 0.43, y: 0.70, z: -0.01 });
    landmarks.push({ x: 0.38, y: 0.65, z: -0.02 });
    landmarks.push({ x: 0.34, y: 0.61, z: -0.03 });
    landmarks.push({ x: tUp ? 0.28 : 0.40, y: tUp ? 0.58 : 0.63 + noise(), z: -0.04 });

    // Index Point 5,6,7,8 
    const iUp = states[1] === 1;
    landmarks.push({ x: 0.46, y: 0.61, z: 0.0 });
    landmarks.push({ x: 0.46, y: 0.54, z: -0.01 });
    landmarks.push({ x: 0.46, y: 0.48, z: -0.02 });
    landmarks.push({ x: 0.46, y: iUp ? 0.36 + noise() : 0.54 + noise(), z: -0.03 });

    // Middle Point 9,10,11,12
    const mUp = states[2] === 1;
    landmarks.push({ x: 0.50, y: 0.60, z: 0.0 });
    landmarks.push({ x: 0.50, y: 0.52, z: -0.01 });
    landmarks.push({ x: 0.50, y: 0.45, z: -0.02 });
    landmarks.push({ x: 0.50, y: mUp ? 0.33 + noise() : 0.53 + noise(), z: -0.03 });

    // Ring Point 13,14,15,16
    const rUp = states[3] === 1;
    landmarks.push({ x: 0.54, y: 0.61, z: 0.0 });
    landmarks.push({ x: 0.54, y: 0.54, z: -0.01 });
    landmarks.push({ x: 0.54, y: 0.48, z: -0.02 });
    landmarks.push({ x: 0.54, y: rUp ? 0.36 + noise() : 0.54 + noise(), z: -0.03 });

    // Pinky Point 17, 18, 19, 20
    const pUp = states[4] === 1;
    landmarks.push({ x: 0.58, y: 0.63, z: 0.0 });
    landmarks.push({ x: 0.58, y: 0.57, z: -0.01 });
    landmarks.push({ x: 0.58, y: 0.52, z: -0.02 });
    landmarks.push({ x: 0.58, y: pUp ? 0.42 + noise() : 0.56 + noise(), z: -0.03 });

    return landmarks;
  };

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0F172A]/40 backdrop-blur-md p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col h-full">
      
      {/* Visual Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="font-sans text-sm font-bold tracking-wider text-slate-100 uppercase">
            {useSimulation ? "Interactive Sandbox Glove" : "Encrypted Telemetry Feed"}
          </h2>
        </div>

        {/* Action controllers */}
        <div className="flex gap-2">
          {useSimulation ? (
            <button
              id="webcam-fallback-trigger"
              onClick={initWebcamMediaPipe}
              disabled={cameraLoading}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 font-mono text-xs font-semibold text-cyan-400 hover:bg-cyan-950/40 transition-all disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{cameraLoading ? "Loading MediaPipe..." : "Acquire Camera"}</span>
            </button>
          ) : (
            <button
              onClick={stopWebcamStream}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-1 font-mono text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-all"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Disconnect Camera</span>
            </button>
          )}

          <button
            onClick={() => setUseSimulation(!useSimulation)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs font-semibold transition-all ${
              useSimulation 
                ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400" 
                : "border-slate-800 bg-[#0B0F19]/50 text-slate-400"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Simulate: {useSimulation ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Frame Alert Notifications */}
      {cameraBlocked && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          <p className="font-mono text-[10px] text-rose-300">
            WEBCAM IS BLOCKED BY THE IFRAME SECURE CONTEXT. FALLING BACK GRACEFULLY TO INTERACTIVE SIMULATION MODE SO ALL GESTURES REMAIN COMPLETELY TESTABLE.
          </p>
        </div>
      )}

      {/* Main Interactive Screen Segment */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-800 bg-black min-h-[300px]">
        
        {/* Real HTML5 camera video hidden canvas feed */}
        <video
          ref={videoRef}
          className="hidden"
          width="640"
          height="480"
          playsInline
          muted
        />

        {/* Coordinate Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="w-full h-full object-cover rounded-xl"
        />

        {/* Guided matching indicator overlays */}
        {selectedPracticeTarget && (
          <div className="absolute top-3 left-3 rounded-lg bg-black/80 border border-amber-500/50 p-2 text-left font-mono text-xs backdrop-blur-md">
            <span className="text-slate-400 block text-[9.5px]">PRACTICE EXERCISE GOAL:</span>
            <span className="text-amber-400 font-extrabold uppercase mr-1">{selectedPracticeTarget}</span>
            {activeGesture?.id === selectedPracticeTarget ? (
              <span className="text-emerald-400 text-[10px] ml-1 font-bold">✓ GESTURE ALIGNED!</span>
            ) : (
              <span className="text-slate-400 text-[10px] ml-1">⌛ Match sign state...</span>
            )}
          </div>
        )}

        {/* Predictive float ticker */}
        <div className="absolute bottom-3 right-3 flex items-center gap-3 rounded-xl bg-black/85 border border-cyan-500/30 p-3 shadow-2xl backdrop-blur-md">
          <div className="text-left">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Predicted Gesture</p>
            <p className="font-sans text-2xl font-black text-white mt-0.5 tracking-tight flex items-center gap-1.5">
              <span>{activeGesture?.visualSymbol}</span>
              <span className="text-cyan-400">{activeGesture?.name || "REBOOTING..."}</span>
            </p>
          </div>
          <div className="border-l border-slate-800 pl-3 text-left">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Match Confidence</p>
            <p className={`font-mono text-xl font-bold mt-0.5 ${activeConfidence > 75 ? 'text-emerald-400' : 'text-rose-400 font-black animate-pulse'}`}>
              {activeConfidence}%
            </p>
          </div>
        </div>

        {/* Interactive calibration ticker */}
        <div className="absolute top-3 right-3 font-mono text-[9px] text-cyan-400 bg-[#0F172A]/90 border border-cyan-500/20 px-2 py-1 rounded-md backdrop-blur-sm shadow-md flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
          </span>
          <span>CV ACTIVE: {useSimulation ? "EMULATION ENGINE" : "RAW MEDIA_PIPE"}</span>
        </div>
      </div>

      {/* Simulator Sandbox Controller - Show if Simulation is on */}
      {useSimulation && (
        <div className="mt-4 border-t border-slate-800/60 pt-4 flex flex-col gap-3">
          
          {/* Quick preset dictionary selector */}
          <div className="flex flex-col gap-1 text-left">
            <label className="font-mono text-[10px] uppercase tracking-wide text-cyan-400/80">
              Select Preset Sign Pose to Emulate:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-[105px] overflow-y-auto pr-1">
              {ASL_DICTIONARY.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSimulatedSelectedId(g.id);
                  }}
                  className={`px-2 py-1 font-mono text-[10px] font-semibold border rounded transition-all ${
                    simulatedSelectedId === g.id
                      ? "bg-cyan-500 border-cyan-500 text-black font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span className="mr-1">{g.visualSymbol}</span>{g.name}
                </button>
              ))}

              {/* Custom manual sandbox glove option */}
              <button
                id="custom-sandbox-option"
                onClick={() => {
                  setSimulatedSelectedId("CUSTOM");
                }}
                className={`px-2 py-1 font-mono text-[10px] font-semibold border rounded transition-all ${
                  simulatedSelectedId === "CUSTOM"
                    ? "bg-emerald-500 border-emerald-500 text-black font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🎛️ CUSTOM SANDBOX GLOVE</span>
              </button>
            </div>
          </div>

          {/* Render sliders if Sandbox Custom is selected */}
          {simulatedSelectedId === "CUSTOM" && (
            <div className="grid grid-cols-5 gap-2 border border-emerald-500/20 rounded-xl bg-emerald-950/5 p-3">
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-mono text-[9px] text-slate-300">THUMB</span>
                <button
                  onClick={() => setSimThumb(!simThumb)}
                  className={`w-full py-1.5 rounded text-[10px] font-mono font-bold ${simThumb ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-950 text-slate-500'}`}
                >
                  {simThumb ? "UP" : "DOWN"}
                </button>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="font-mono text-[9px] text-slate-300">INDEX</span>
                <button
                  onClick={() => setSimIndex(!simIndex)}
                  className={`w-full py-1.5 rounded text-[10px] font-mono font-bold ${simIndex ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-950 text-slate-500'}`}
                >
                  {simIndex ? "UP" : "DOWN"}
                </button>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="font-mono text-[9px] text-slate-300">MIDDLE</span>
                <button
                  onClick={() => setSimMiddle(!simMiddle)}
                  className={`w-full py-1.5 rounded text-[10px] font-mono font-bold ${simMiddle ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-950 text-slate-500'}`}
                >
                  {simMiddle ? "UP" : "DOWN"}
                </button>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="font-mono text-[9px] text-slate-300">RING</span>
                <button
                  onClick={() => setSimRing(!simRing)}
                  className={`w-full py-1.5 rounded text-[10px] font-mono font-bold ${simRing ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-950 text-slate-500'}`}
                >
                  {simRing ? "UP" : "DOWN"}
                </button>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="font-mono text-[9px] text-slate-300">PINKY</span>
                <button
                  onClick={() => setSimPinky(!simPinky)}
                  className={`w-full py-1.5 rounded text-[10px] font-mono font-bold ${simPinky ? 'bg-emerald-500 text-black shadow-md' : 'bg-slate-950 text-slate-500'}`}
                >
                  {pUp => "UP"}
                  {simPinky ? "UP" : "DOWN"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
