import express from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
const upload = multer({ dest: "uploads/" });

/* ---------- MIDDLEWARE ---------- */
app.use(
  cors({
    origin: "*", // allow GitHub Pages & any frontend
  })
);
app.use(express.json());

/* ---------- HEALTH CHECK (IMPORTANT FOR RENDER) ---------- */
app.get("/", (req, res) => {
  res.send("✅ AI-Guide backend is running");
});

/* ---------- OCR IMAGE ---------- */
app.post("/api/read-image", upload.single("image"), async (req, res) => {
  try {
    const result = await Tesseract.recognize(req.file.path, "eng");
    res.json({ text: result.data.text || "" });
  } catch (err) {
    console.error(err);
    res.json({ text: "" });
  }
});

/* ---------- AI STEP RESPONSE ---------- */
app.post("/api/ask-ai", async (req, res) => {
  const { studentName, subject, question } = req.body;

  const prompt = `
You are an AI Learning Guide for school students.

STRICT:
Return ONLY valid JSON.
No markdown. No explanation outside JSON.

JSON FORMAT:
{
  "steps": ["step1","step2"],
  "encouragement": "short message"
}

Rules:
- No final answers
- Simple language
- Step by step
- Kid friendly

Student: ${studentName}
Subject: ${subject}
Question: ${question}
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        input: prompt,
        max_output_tokens: 500,
      }),
    });

    const data = await response.json();

    let text = "";
    if (Array.isArray(data.output)) {
      const msg = data.output.find((o) => o.type === "message");
      text = msg?.content?.map((c) => c.text).join("") || "";
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        steps: ["I am thinking… please try again."],
        encouragement: "Keep going!",
      };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.json({
      steps: ["AI service error. Please try again."],
      encouragement: "You are doing great!",
    });
  }
});

/* ---------- START SERVER (CRITICAL FIX) ---------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
