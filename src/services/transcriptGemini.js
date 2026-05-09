import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * @param {string} rawText
 * @param {string} apiKey VITE_GEMINI_API_KEY from import.meta.env
 * @returns {Promise<{ courses: { courseName: string, credits: number, grade: number }[], error?: string }>}
 */
export async function parseTranscriptWithGemini(rawText, apiKey) {
  if (!apiKey) {
    return { courses: [], error: "Gemini API key is not configured." };
  }
  if (!rawText?.trim()) {
    return { courses: [], error: "No text extracted from file." };
  }

  const truncated = rawText.slice(0, 24_000);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `You extract course rows for a GPA calculator from transcript or grade list text.

Return ONLY valid JSON in this exact shape (no markdown):
{"courses":[{"courseName":"string","credits":number,"grade":number},...]}

Rules:
- credits: credit hours / units (positive number)
- grade: numeric grade points on the student's scale (e.g. 4.0 scale: 0-4, 5.0 scale: 0-5)
- courseName: course code and/or title if present
- Skip header lines, totals, GPA summary lines, dean's list, etc.
- If uncertain, omit that line

Text:
---
${truncated}
---`;

  try {
    const res = await model.generateContent(prompt);
    const txt = res.response.text();
    const parsed = JSON.parse(txt);
    const list = Array.isArray(parsed.courses) ? parsed.courses : [];
    const courses = [];
    for (const c of list) {
      const courseName = String(c.courseName ?? "").trim();
      const credits = Number(c.credits);
      const grade = Number(c.grade);
      if (!courseName || !Number.isFinite(credits) || !Number.isFinite(grade))
        continue;
      courses.push({
        courseName: courseName.slice(0, 120),
        credits,
        grade,
      });
    }
    return { courses };
  } catch (e) {
    console.error(e);
    return {
      courses: [],
      error:
        e.message ||
        "Gemini request failed. Check API key, quota, and model availability.",
    };
  }
}
