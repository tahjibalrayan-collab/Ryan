import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/generate-routine", async (req, res) => {
    try {
      const { subjects, availableHours, struggles, preferredTradition } = req.body ?? {};

      if (!subjects || typeof subjects !== "string" || !subjects.trim()) {
        res.status(400).json({ error: "Please enter at least one subject to build a routine." });
        return;
      }

      const ai = getGeminiClient();

      const prompt = [
        `Design a personalized, disciplined daily study routine and actionable tactical guidance for a student.`,
        `Subjects: ${subjects.trim()}`,
        `Available Study Time Today: ${availableHours || "3 hours"}`,
        `Preferred Method Tradition: ${preferredTradition || "Balanced Blend (East Asian Focus + Peking Intensive + Ivy League Recall)"}`,
        `Current Study Struggles: ${struggles?.trim() || "Maintaining deep concentration and long-term retention"}`,
        `Incorporate authentic principles from Korean Gongbu 50/10 focus blocks, Japanese Kaizen/Todai 3-zone margin method, Chinese/Peking University intensive problem-escalation loops, Harvard/Stanford Active Recall, and Oxford/Feynman simplification where relevant.`,
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an elite academic performance strategist. Return concise, practical, realistic study routines without fluff or generic motivational filler. Ensure block durations realistically fit within the user's stated available time.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A concise, sharp editorial title for this study routine.",
              },
              diagnosis: {
                type: Type.STRING,
                description: "2-sentence diagnosis addressing the student's stated struggles and workload balance.",
              },
              dailyPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeSlot: {
                      type: Type.STRING,
                      description: "Relative block label like 'Block 1 · 00:00–00:50'",
                    },
                    subject: {
                      type: Type.STRING,
                      description: "Subject name",
                    },
                    method: {
                      type: Type.STRING,
                      description: "Specific global study method applied (e.g., 'Peking 90m Intensive', 'Feynman Simplification')",
                    },
                    durationMinutes: {
                      type: Type.INTEGER,
                      description: "Focus duration in minutes (e.g., 25, 35, 45, 50, 60)",
                    },
                    objective: {
                      type: Type.STRING,
                      description: "Concrete deliverable for this block",
                    },
                    techniqueStep: {
                      type: Type.STRING,
                      description: "Exact step-by-step execution instruction",
                    },
                  },
                  required: ["timeSlot", "subject", "method", "durationMinutes", "objective", "techniqueStep"],
                },
              },
              tacticalAdvice: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "3 to 4 sharp, specific action rules directly solving the user's struggles.",
              },
              spacedRepetitionNote: {
                type: Type.STRING,
                description: "How to schedule Day 1, Day 4, Day 7, and Day 14 reviews for these specific subjects.",
              },
            },
            required: ["title", "diagnosis", "dailyPlan", "tacticalAdvice", "spacedRepetitionNote"],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "Empty response received from Gemini." });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate personalized study routine.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Personal Archive server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
