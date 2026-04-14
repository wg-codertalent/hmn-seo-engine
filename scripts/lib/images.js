import fs from "node:fs/promises";
import path from "node:path";
import { imagePrompt } from "../../config/prompts.js";

const MODEL = "gpt-image-1";
const ENDPOINT = "https://api.openai.com/v1/images/generations";

export async function generateCoverImage(title, outPath) {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: imagePrompt(title),
      size: "1536x1024",
      n: 1
    })
  });
  if (!res.ok) throw new Error(`Image API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, Buffer.from(b64, "base64"));
  return outPath;
}
