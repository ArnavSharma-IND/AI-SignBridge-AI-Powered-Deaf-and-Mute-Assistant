import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

// Shared Gemini client utility with proper telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY_FOR_BUILD",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Sentence Correction & Context-Aware Translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { rawSequence, context, language = "English" } = req.body;

      if (!rawSequence || rawSequence.length === 0) {
        return res.json({ correctedText: "", meaningExplanation: "" });
      }

      const prompt = `You are the core translation engine of AI SignBridge.
A sign language user has gestured the following sequence of raw signs: "${rawSequence.join(" -> ")}".
The conversation context is: "${context || "General interaction / Casual conversation"}".
The user wants the final spoken/written output in the following language: "${language}".

Your tasks:
1. Smooth out, correct the grammar, and translate this sequence into a highly polite, natural, and context-aware sentence in the target language.
2. Explain the emotional coloring if any was implied.
3. If the sequence is incomplete or requires bridging words, predict them reasonably.

Respond STRICTLY with a JSON object inside valid JSON blocks, adhering exactly to this schema:
{
  "correctedText": "Natural, grammatically polished translation here",
  "meaningExplanation": "Brief 1-sentence analytical breakdown of the translation, context influence, and gestures used"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              correctedText: { type: Type.STRING },
              meaningExplanation: { type: Type.STRING }
            },
            required: ["correctedText", "meaningExplanation"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const result = JSON.parse(jsonText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Translate API Error:", error);
      res.status(500).json({
        correctedText: req.body.rawSequence?.join(" ") || "Error in AI Translation",
        meaningExplanation: "AI Translator is currently offline. Showing raw literal sequence instead.",
        error: error.message
      });
    }
  });

  // API Route: Gesture Posture Coaching & AI Guided Feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const { targetGesture, landmarks, userAccuracy } = req.body;

      // landmarks is the 21 coordinate array of {x, y, z}
      const landmarkString = landmarks 
        ? landmarks.map((l: any, i: number) => `Pt ${i}: (${l.x.toFixed(3)}, ${l.y.toFixed(3)}, ${l.z.toFixed(3)})`).join(" | ")
        : "No landmarks submitted";

      const prompt = `You are an expert ASL (American Sign Language) Instructor teaching gesture accuracy in the AI SignBridge dynamic training lab.
The user is attempting to perform the gesture for: "${targetGesture}".
Their current algorithmic classification similarity match score is: ${userAccuracy || 50}%.
Here is the raw spatial 3D data of their 21 hand landmarks (where 0 is the wrist, 4 is thumb tip, 8 is index tip, 12 is middle tip, 16 is ring tip, 20 is pinky tip):
${landmarkString.substring(0, 1000)}

Analyze the hand coordinates. Generate personalized, friendly, and practical visual feedback to guide the user on how to correct their finger extensions, angles, and wrist orientation to make a perfect sign for "${targetGesture}". Keep comments concise and highly encouraging!

Format your response as a JSON object matching this schema:
{
  "coachingVerdict": "Excellent attempt! Let's polish the thumb position.",
  "concreteActionStep": "Raise your thumb slightly higher and separate your fingers a bit more for a cleaner reading",
  "tips": [
    "Ensure your wrist is aligned forward and not tilted",
    "Relax your middle and ring fingers, curl them slightly more into the palm",
    "Keep your index finger pointed straight, completely vertical"
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachingVerdict: { type: Type.STRING },
              concreteActionStep: { type: Type.STRING },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["coachingVerdict", "concreteActionStep", "tips"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const result = JSON.parse(jsonText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Coaching Feedback API Error:", error);
      res.status(500).json({
        coachingVerdict: "Could not fetch AI Feedback at this moment.",
        concreteActionStep: "Keep practicing standard signs and check landmarks alignment visually.",
        tips: [
          "Ensure your hand is fully in the camera frame",
          "Ensure high contrast lighting and avoid busy background noise",
          "Keep your hand steady during posture analysis"
        ],
        error: error.message
      });
    }
  });

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Serve static assets and bind Vite dev middleware or standard bundle
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving Production Static Builds from dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI SignBridge backend is running on http://localhost:${PORT}`);
  });
}

startServer();
