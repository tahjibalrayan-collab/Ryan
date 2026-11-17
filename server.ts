import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SYNC_DIR = path.resolve(__dirname, "data");
const SYNC_FILE = path.join(SYNC_DIR, "archive-sync.json");

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

function readSyncedArchive(): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(SYNC_FILE)) return null;
    const raw = fs.readFileSync(SYNC_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeSyncedArchive(payload: Record<string, unknown>): void {
  if (!fs.existsSync(SYNC_DIR)) {
    fs.mkdirSync(SYNC_DIR, { recursive: true });
  }
  fs.writeFileSync(SYNC_FILE, JSON.stringify(payload, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Cross-device archive sync endpoints (PC <-> Mobile over same hosted URL)
  app.get("/api/archive", (_req, res) => {
    const data = readSyncedArchive();
    res.json({ ok: true, archive: data });
  });

  app.post("/api/archive", (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== "object") {
        res.status(400).json({ error: "Invalid archive payload." });
        return;
      }
      const enriched = {
        ...payload,
        syncedAt: new Date().toISOString(),
      };
      writeSyncedArchive(enriched);
      res.json({ ok: true, syncedAt: enriched.syncedAt });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to save sync snapshot.",
      });
    }
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
        `Preferred Method Tradition: ${preferredTradition || "Balanced Blend"}`,
        `Current Study Struggles: ${struggles?.trim() || "Maintaining deep concentration and long-term retention"}`,
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an elite academic performance strategist. Return concise, practical, realistic study routines without fluff.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              diagnosis: { type: Type.STRING },
              dailyPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeSlot: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    method: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                    objective: { type: Type.STRING },
                    techniqueStep: { type: Type.STRING },
                  },
                  required: ["timeSlot", "subject", "method", "durationMinutes", "objective", "techniqueStep"],
                },
              },
              tacticalAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              spacedRepetitionNote: { type: Type.STRING },
            },
            required: ["title", "diagnosis", "dailyPlan", "tacticalAdvice", "spacedRepetitionNote"],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "Empty response received." });
        return;
      }

      res.json(JSON.parse(rawText));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate routine.";
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
