import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imagePrompt } from "../../config/prompts.js";

const MODEL = "gemini-3.1-flash-image-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function generateCoverImage(title, outPath) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

  const webpPath = outPath.replace(/\.png$/, ".webp");

  const res = await fetch(`${ENDPOINT}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: imagePrompt(title) }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "16:9" }
      }
    })
  });
  if (!res.ok) throw new Error(`Image API error ${res.status}: ${await res.text()}`);
  const data = await res.json();

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) throw new Error(`No image in response: ${JSON.stringify(data)}`);
  const rawBuffer = Buffer.from(imagePart.inlineData.data, "base64");

  await fs.mkdir(path.dirname(webpPath), { recursive: true });
  await sharp(rawBuffer)
    .resize(1200, 630, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(webpPath);

  return webpPath;
}
