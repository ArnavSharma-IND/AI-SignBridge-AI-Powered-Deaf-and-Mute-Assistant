import { GestureInfo, Landmark } from "../types";

// Official Dictionary of supported signs with exact mathematical target configurations
export const ASL_DICTIONARY: GestureInfo[] = [
  // ALPHABET
  { id: "A", name: "A", category: "Alphabet", fingerState: [0, 0, 0, 0, 0], description: "Fist with thumb tucked tightly on the side", visualSymbol: "✊" },
  { id: "B", name: "B", category: "Alphabet", fingerState: [1, 1, 1, 1, 1], description: "Flat open hand, all five fingers vertical and pressed together", visualSymbol: "✋" },
  { id: "C", name: "C", category: "Alphabet", fingerState: [0, 0, 0, 0, 0], description: "Curved cup-like posture, mimicking the letter C shape", visualSymbol: "⮏" },
  { id: "D", name: "D", category: "Alphabet", fingerState: [0, 1, 0, 0, 0], description: "Index finger straight up, other fingers touching thumb", visualSymbol: "☝" },
  { id: "E", name: "E", category: "Alphabet", fingerState: [0, 0, 0, 0, 0], description: "Clawed fist, tips of all fingers curled toward the palm knuckles", visualSymbol: "🤛" },
  { id: "F", name: "F", category: "Alphabet", fingerState: [0, 0, 1, 1, 1], description: "Tip of index and thumb touching, other three fingers extended", visualSymbol: "👌" },
  { id: "G", name: "G", category: "Alphabet", fingerState: [1, 1, 0, 0, 0], description: "Thumb and index finger pointing horizontal like small pinch", visualSymbol: "👈" },
  { id: "H", name: "H", category: "Alphabet", fingerState: [0, 1, 1, 0, 0], description: "Index and middle fingers extended straight horizontally side-by-side", visualSymbol: "👉" },
  { id: "I", name: "I", category: "Alphabet", fingerState: [0, 0, 0, 0, 1], description: "Pinky finger straight up, all other fingers closed", visualSymbol: "🤙" },
  { id: "K", name: "K", category: "Alphabet", fingerState: [1, 1, 1, 0, 0], description: "Index and middle straight up, thumb resting on index middle joint", visualSymbol: "✌" },
  { id: "L", name: "L", category: "Alphabet", fingerState: [1, 1, 0, 0, 0], description: "Thumb and index extended forming right angle", visualSymbol: "🤙" },
  { id: "M", name: "M", category: "Alphabet", fingerState: [0, 0, 0, 0, 0], description: "Thumb folder under three fingers: index, middle, ring", visualSymbol: "✊" },
  { id: "N", name: "N", category: "Alphabet", fingerState: [0, 0, 0, 0, 0], description: "Thumb tucked under index and middle fingers", visualSymbol: "✊" },
  { id: "O", name: "O", category: "Alphabet", fingerState: [0, 0, 0, 0, 0], description: "All fingers curved and touching the thumb in a circle O", visualSymbol: "👌" },
  { id: "U", name: "U", category: "Alphabet", fingerState: [0, 1, 1, 0, 0], description: "Index and middle fingers vertical, pressed tight", visualSymbol: "☝" },
  { id: "V", name: "V", category: "Alphabet", fingerState: [0, 1, 1, 0, 0], description: "Peace Sign. Index and middle fingers spread apart", visualSymbol: "✌" },
  { id: "W", name: "W", category: "Alphabet", fingerState: [0, 1, 1, 1, 0], description: "Index, middle, and ring pointing up, forming W", visualSymbol: "✋" },
  { id: "Y", name: "Y", category: "Alphabet", fingerState: [1, 0, 0, 0, 1], description: "Thumb and pinky fully extended, other fingers folded", visualSymbol: "🤙" },

  // NUMBERS
  { id: "0", name: "0", category: "Number", fingerState: [0, 0, 0, 0, 0], description: "Circle O shape representing zero", visualSymbol: "0️⃣" },
  { id: "1", name: "1", category: "Number", fingerState: [0, 1, 0, 0, 0], description: "Index finger pointing up", visualSymbol: "1️⃣" },
  { id: "2", name: "2", category: "Number", fingerState: [0, 1, 1, 0, 0], description: "Index and middle extended up", visualSymbol: "2️⃣" },
  { id: "3", name: "3", category: "Number", fingerState: [1, 1, 1, 0, 0], description: "Thumb, index, and middle extended", visualSymbol: "3️⃣" },
  { id: "4", name: "4", category: "Number", fingerState: [0, 1, 1, 1, 1], description: "Four fingers extended, thumb folder inside", visualSymbol: "4️⃣" },
  { id: "5", name: "5", category: "Number", fingerState: [1, 1, 1, 1, 1], description: "All five fingers expanded widely", visualSymbol: "5️⃣" },
  { id: "6", name: "6", category: "Number", fingerState: [0, 1, 1, 1, 0], description: "Pinky and thumb touch; index, middle, ring extended", visualSymbol: "6️⃣" },
  { id: "7", name: "7", category: "Number", fingerState: [0, 1, 1, 0, 1], description: "Ring finger and thumb touch; others up", visualSymbol: "7️⃣" },
  { id: "8", name: "8", category: "Number", fingerState: [0, 1, 0, 1, 1], description: "Middle finger and thumb touch; others up", visualSymbol: "8️⃣" },
  { id: "9", name: "9", category: "Number", fingerState: [0, 0, 1, 1, 1], description: "Index finger and thumb touch; others up", visualSymbol: "9️⃣" },

  // COMMON WORDS
  { id: "HELLO", name: "HELLO", category: "Word", fingerState: [1, 1, 1, 1, 1], description: "Open flat palm near temple moving out in a salute", visualSymbol: "👋" },
  { id: "THANK_YOU", name: "THANK YOU", category: "Word", fingerState: [0, 1, 1, 1, 1], description: "Fingertip touching chin, then moving forward and down", visualSymbol: "🙏" },
  { id: "WATER", name: "WATER", category: "Word", fingerState: [0, 1, 1, 1, 0], description: "Making a 'W' position with index/middle/ring and tapping chin", visualSymbol: "💧" },
  { id: "PLEASE", name: "PLEASE", category: "Word", fingerState: [1, 1, 1, 1, 1], description: "Flat hand rubbing chest circular clockwise", visualSymbol: "❤️" },
  { id: "FOOD", name: "FOOD", category: "Word", fingerState: [0, 0, 0, 0, 0], description: "Fingers bunched touching thumb tip, tapped on lips", visualSymbol: "🍎" },
  { id: "YES", name: "YES", category: "Word", fingerState: [0, 0, 0, 0, 0], description: "Fist nodding up and down like a head rocking", visualSymbol: "👍" },
  { id: "NO", name: "NO", category: "Word", fingerState: [1, 1, 1, 0, 0], description: "Index and middle snap down to tap the thumb", visualSymbol: "👎" },

  // EMERGENCY GESTURES
  { id: "HELP", name: "HELP", category: "Emergency", fingerState: [1, 0, 0, 0, 0], description: "Dominant thumb up, resting on flat non-dominant hand", visualSymbol: "🆘" },
  { id: "SOS", name: "SOS", category: "Emergency", fingerState: [0, 0, 0, 0, 0], description: "Fist closed rapidly flashing/pulsing red light states", visualSymbol: "🚨" },
  { id: "DANGER", name: "DANGER", category: "Emergency", fingerState: [1, 1, 1, 1, 1], description: "High frequency shaking open hand in sweeping warning", visualSymbol: "⚠️" }
];

// Helper to calculate Euclidean distance between two 3D points
export function calculateDistance(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

// Landmark core analysis: Converts 21 coordinates into a finger state vector
// Returns [Thumb, Index, Middle, Ring, Pinky] (0-1 floats where close to 1 is fully extended, close to 0 is curled)
export function analyzeFingerStates(landmarks: Landmark[]): [number, number, number, number, number] {
  if (!landmarks || landmarks.length < 21) {
    return [0, 0, 0, 0, 0];
  }

  const wrist = landmarks[0];

  // Helper: Checks extension relative to secondary joints and knuckles
  const checkExtension = (tipIdx: number, dipIdx: number, pipIdx: number, mcpIdx: number): number => {
    const tip = landmarks[tipIdx];
    const pip = landmarks[pipIdx];
    const mcp = landmarks[mcpIdx];

    const dTipWrist = calculateDistance(tip, wrist);
    const dPipWrist = calculateDistance(pip, wrist);
    const dMcpWrist = calculateDistance(mcp, wrist);

    // If tip is further from the wrist than middle joint or knuckles, it's extended
    if (dTipWrist > dPipWrist && dTipWrist > dMcpWrist) {
      // Scale based on proportion
      const ratio = (dTipWrist - dPipWrist) / dPipWrist;
      return Math.min(1.0, Math.max(0.0, 0.5 + ratio * 1.5));
    }
    return Math.max(0.0, Math.min(0.4, dTipWrist / dMcpWrist));
  };

  // Special Check for Thumb: Compare distance from knuckle of index (MCP point 5)
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexMcp = landmarks[5];
  const dThumbIndexMcp = calculateDistance(thumbTip, indexMcp);
  const dIpIndexMcp = calculateDistance(thumbIp, indexMcp);
  const thumbState = dThumbIndexMcp > dIpIndexMcp * 1.15 ? 1.0 : 0.0;

  const indexState = checkExtension(8, 7, 6, 5) > 0.45 ? 1.0 : 0.0;
  const middleState = checkExtension(12, 11, 10, 9) > 0.45 ? 1.0 : 0.0;
  const ringState = checkExtension(16, 15, 14, 13) > 0.45 ? 1.0 : 0.0;
  const pinkyState = checkExtension(20, 19, 18, 17) > 0.45 ? 1.0 : 0.0;

  return [thumbState, indexState, middleState, ringState, pinkyState];
}

// Match hand landmarks to the closest dictionary item and returns score details
export function classifyGesture(landmarks: Landmark[]): { gesture: GestureInfo; confidence: number; fingerAccuracy: number[] } {
  const currentFingerState = analyzeFingerStates(landmarks);
  
  let bestGesture = ASL_DICTIONARY[0];
  let maxConfidence = 0.0;
  let bestFeatureAccuracy: number[] = [0, 0, 0, 0, 0];

  for (const item of ASL_DICTIONARY) {
    let score = 0;
    const accuracies: number[] = [];

    // Calculate match factor between our binary state and target state
    for (let i = 0; i < 5; i++) {
      const matchDiff = Math.abs(currentFingerState[i] - item.fingerState[i]);
      const accuracy = 100 - matchDiff * 100;
      accuracies.push(accuracy);
      score += accuracy;
    }

    const avgScorePercentage = score / 5;
    
    // Add micro variations mapping to simulate fine tracking
    let landmarkMatchModifier = 1.0;
    if (item.category === "Emergency") {
      // Emergency signs match with high noise threshold
      landmarkMatchModifier = 0.96;
    }

    const confidence = Math.min(100, Math.max(30, avgScorePercentage * landmarkMatchModifier));
    
    if (confidence > maxConfidence) {
      maxConfidence = confidence;
      bestGesture = item;
      bestFeatureAccuracy = accuracies;
    }
  }

  return {
    gesture: bestGesture,
    confidence: Math.round(maxConfidence),
    fingerAccuracy: bestFeatureAccuracy
  };
}

// Simulated dynamic coordinates generator for the landmark viewer!
// If no webcam, this generates beautiful math coordinates pulsing with noise.
export function generateSimulatedLandmarks(gestureId: string, timePhase: number = 0): Landmark[] {
  const gesture = ASL_DICTIONARY.find(g => g.id === gestureId) || ASL_DICTIONARY[0];
  const states = gesture.fingerState;

  // Base coordinates in pixel offsets centered around X:0.5, Y:0.6
  const landmarks: Landmark[] = [];
  
  // Base wrist
  landmarks.push({ x: 0.5, y: 0.75, z: 0 });

  // Add subtle breathing motion
  const noise = () => Math.sin(timePhase * 2) * 0.006;
  const jitterY = () => Math.cos(timePhase * 3) * 0.004;

  // Thumb positions: point 1, 2, 3, 4
  const hasThumb = states[0] === 1;
  landmarks.push({ x: 0.43, y: 0.70 + noise(), z: -0.01 });
  landmarks.push({ x: 0.38, y: 0.65 + noise(), z: -0.02 });
  landmarks.push({ x: 0.34, y: 0.61 + noise(), z: -0.03 });
  landmarks.push({ x: hasThumb ? 0.28 : 0.39, y: hasThumb ? 0.58 : 0.62 + noise(), z: -0.04 });

  // Knuckle bases
  const knucklesX = [0.46, 0.50, 0.54, 0.58];
  
  // Index Finger: 5,6,7,8
  const hasIndex = states[1] === 1;
  landmarks.push({ x: 0.46, y: 0.61, z: 0.0 });
  landmarks.push({ x: 0.46, y: 0.54 + noise(), z: -0.01 });
  landmarks.push({ x: 0.46, y: 0.48 + noise(), z: -0.02 });
  landmarks.push({ x: 0.46 + jitterY(), y: hasIndex ? 0.38 + noise() : 0.53 + noise(), z: -0.03 });

  // Middle Finger: 9,10,11,12
  const hasMiddle = states[2] === 1;
  landmarks.push({ x: 0.50, y: 0.60, z: 0.0 });
  landmarks.push({ x: 0.50, y: 0.52 + noise(), z: -0.01 });
  landmarks.push({ x: 0.50, y: 0.45 + noise(), z: -0.02 });
  landmarks.push({ x: 0.50 + jitterY(), y: hasMiddle ? 0.35 + noise() : 0.52 + noise(), z: -0.03 });

  // Ring Finger: 13,14,15,16
  const hasRing = states[3] === 1;
  landmarks.push({ x: 0.54, y: 0.61, z: 0.0 });
  landmarks.push({ x: 0.54, y: 0.54 + noise(), z: -0.01 });
  landmarks.push({ x: 0.54, y: 0.48 + noise(), z: -0.02 });
  landmarks.push({ x: 0.54 + jitterY(), y: hasRing ? 0.38 + noise() : 0.53 + noise(), z: -0.03 });

  // Pinky Finger: 17,18,19,20
  const hasPinky = states[4] === 1;
  landmarks.push({ x: 0.58, y: 0.63, z: 0.0 });
  landmarks.push({ x: 0.58, y: 0.57 + noise(), z: -0.01 });
  landmarks.push({ x: 0.58, y: 0.52 + noise(), z: -0.02 });
  landmarks.push({ x: 0.58 + jitterY(), y: hasPinky ? 0.44 + noise() : 0.55 + noise(), z: -0.03 });

  return landmarks;
}

// Localization Dictionary Profiles
export const LOCALIZATION: Record<string, Record<string, string>> = {
  English: {
    appTitle: "AI SignBridge",
    appSub: "Real-time sign translation and learning workspace",
    btnWebcam: "Live Webcam Feed",
    btnSimul: "Landmark Simulation Lab",
    btnExport: "Export logs",
    sentenceBuilder: "Translation Workbench",
    emotion: "Aura / Emotion Context",
    confidence: "Algorithmic Confidence",
    statsTitle: "Workspace Telemetry & Analytics",
    learningTitle: "Sign Learning Academy",
    learningSubtitle: "Interact, study, and pass practice quizzes to build ASL proficiency",
    feedbackTitle: "AI Posture Tutor & Coaching Feed",
    emergencyDetected: "EMERGENCY GESTURE DETECTED!"
  },
  Hindi: {
    appTitle: "एआई साइनब्रिज",
    appSub: "वास्तविक समय संकेत अनुवाद और सीखने का कार्यक्षेत्र",
    btnWebcam: "लाइव वेबकैम फीड",
    btnSimul: "लैंडमार्क सिमुलेशन लैब",
    btnExport: "लॉग्स निर्यात करें",
    sentenceBuilder: "अनुवाद कार्यक्षेत्र",
    emotion: "भावना / प्रसंग",
    confidence: "अनुमानित सटीकता",
    statsTitle: "कार्यक्षेत्र टेलीमेट्री और विश्लेषण",
    learningTitle: "साइन लर्निंग अकादमी",
    learningSubtitle: "इंटरैक्ट करें, अध्ययन करें और ASL प्रवीणता बनाने के लिए अभ्यास क्विज़ पास करें",
    feedbackTitle: "एआई आसन ट्यूटर और कोचिंग फीड",
    emergencyDetected: "आपातकालीन संकेत का पता चला!"
  },
  Bengali: {
    appTitle: "এআই সাইনব্রিজ",
    appSub: "রিয়েল-টাইম সাইন অনুবাদ এবং শেখার ওয়ার্কস্পেস",
    btnWebcam: "লাইভ ওয়েবক্যাম ফিড",
    btnSimul: "ল্যান্ডমার্ক সিমুলেশন ল্যাব",
    btnExport: "লগ রপ্তানি করুন",
    sentenceBuilder: "অনুবাদ ওয়ার্কবেঞ্চ",
    emotion: "আবেগ / অনুভূতির প্রসঙ্গ",
    confidence: "আ্যালগরিদমিক আত্মবিশ্বাস",
    statsTitle: "ওয়ার্কস্পেস টেলিমেট্রি এবং বিশ্লেষণ",
    learningTitle: "সাইন লার্নিং একাডেমি",
    learningSubtitle: "ইন্টারেক্ট করুন, অধ্যয়ন করুন এবং এ এস এল দক্ষতা অর্জনের জন্য কুইজ পাস করুন",
    feedbackTitle: "এআই ভঙ্গি সংস্কার ও নির্দেশিকা ফিড",
    emergencyDetected: "জরুরী ইঙ্গিত সনাক্ত হয়েছে!"
  },
  Marathi: {
    appTitle: "एआय साईनब्रिज",
    appSub: "रिअल-टाइम साईन भाषांतर आणि शिक्षण कार्यक्षेत्र",
    btnWebcam: "थेट वेबकॅम फीड",
    btnSimul: "लँडमार्क सिम्युलेशन लॅब",
    btnExport: "लॉग निर्यात करा",
    sentenceBuilder: "भाषांतर कार्यक्षेत्र",
    emotion: "भावना / संदर्भ",
    confidence: "अल्गोरिदमिक आत्मविश्वास",
    statsTitle: "टेलीमेट्री आणि विश्लेषण",
    learningTitle: "लाईन लर्निंग अकॅडमी",
    learningSubtitle: "संवाद साधा, अभ्यास करा आणि ASL प्राविण्य मिळवण्यासाठी सराव क्विझ पूर्ण करा",
    feedbackTitle: "एआय आसन ट्यूटर आणि कोचिंग फीड",
    emergencyDetected: "कठिण/आत्कालीन इशारा सापडला!"
  }
};
