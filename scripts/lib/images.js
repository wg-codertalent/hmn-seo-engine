import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imagePrompt } from "../../config/prompts.js";

const MODEL = "gpt-image-1";
const ENDPOINT = "https://api.openai.com/v1/images/generations";

export async function generateCoverImage(title, outPath) {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

  // Use WebP extension instead of PNG
  const webpPath = outPath.replace(/\.png$/, ".webp");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: imagePrompt(title),
      size: "1024x1024",
      n: 1
    })
  });
  if (!res.ok) throw new Error(`Image API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const rawBuffer = Buffer.from(b64, "base64");

  await fs.mkdir(path.dirname(webpPath), { recursive: true });
  await sharp(rawBuffer)
    .resize(1200, 630, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(webpPath);

  return webpPath;
}
