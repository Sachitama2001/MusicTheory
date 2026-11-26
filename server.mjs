import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {candidateSchema, LIBRARIES} from "./candidates.mjs";

const ENDPOINT = "/api/arrangements";
const MAX_BODY = 256 * 1024;
const files = new Map([
  ["/", ["index.html", "text/html"]],
  ["/index.html", ["index.html", "text/html"]],
  ["/candidates.mjs", ["candidates.mjs", "text/javascript"]],
  ...LIBRARIES.map(name => [`/data/${name}.json`, [`data/${name}.json`, "application/json"]])
]);

function json(res, status, body) {
  res.writeHead(status, {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"});
  res.end(JSON.stringify(body));
}

async function readPrompt(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= MAX_BODY) chunks.push(chunk);
  }
  if (size > MAX_BODY) throw new Error("The draft and prompt exceed the 256 KiB request limit.");
  const {prompt} = JSON.parse(Buffer.concat(chunks).toString("utf8")) ?? {};
  if (typeof prompt !== "string" || !prompt.trim()) throw new Error("A prompt is required.");
  return prompt;
}

export function createApp({apiKey, model = "gpt-4.1-mini", fetchOpenAI = fetch} = {}) {
  return createServer({requestTimeout: 15_000}, async (req, res) => {
    const port = req.socket.localPort;
    const host = req.headers.host;
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) {
      return json(res, 403, {error: "Use the local sketchpad address."});
    }
    const path = req.url.split("?")[0];
    if (path === ENDPOINT && req.method === "GET") return json(res, 200, {available: Boolean(apiKey)});
    if (path === ENDPOINT && req.method === "POST") {
      if (req.headers.origin !== `http://${host}` || req.headers["content-type"]?.split(";")[0] !== "application/json") {
        return json(res, 403, {error: "Only same-origin JSON requests are allowed."});
      }
      if (!apiKey) return json(res, 503, {error: "Set OPENAI_API_KEY before starting the local server."});
      let prompt;
      try {
        prompt = await readPrompt(req);
      } catch (error) {
        return json(res, 400, {error: error.message});
      }

      try {
        const response = await fetchOpenAI("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {"Content-Type": "application/json", Authorization: `Bearer ${apiKey}`},
          body: JSON.stringify({
            model, input: prompt, store: false, max_output_tokens: 28000,
            text: {format: {type: "json_schema", name: "arrangement_candidates", strict: true, schema: candidateSchema}}
          }),
          signal: AbortSignal.timeout(150_000)
        });
        if (!response.ok) {
          return json(res, 502, {error: `OpenAI API returned HTTP ${response.status}. Check the server key, model access or quota.`});
        }
        const result = await response.json();
        if (result.status !== "completed") {
          return json(res, 502, {error: "OpenAI did not complete the arrangement. Try a shorter draft or simpler request."});
        }
        const content = result.output.filter(item => item.type === "message").flatMap(item => item.content);
        if (content.some(item => item.type === "refusal")) {
          return json(res, 422, {error: "OpenAI declined the request. Try a different arrangement description."});
        }
        const text = content.filter(item => item.type === "output_text").map(item => item.text).join("");
        return json(res, 200, JSON.parse(text));
      } catch (error) {
        const timedOut = error.name === "TimeoutError";
        return json(res, timedOut ? 504 : 502, {error: timedOut ? "OpenAI request timed out." : "Could not read an arrangement from OpenAI."});
      }
    }

    const file = req.method === "GET" && files.get(path);
    if (!file) return json(res, 404, {error: "Not found."});
    try {
      const content = await readFile(new URL(file[0], import.meta.url));
      res.writeHead(200, {"Content-Type": `${file[1]}; charset=utf-8`});
      res.end(content);
    } catch {
      return json(res, 500, {error: `Could not load ${file[0]}.`});
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 8000);
  createApp({apiKey: process.env.OPENAI_API_KEY?.trim(), model: process.env.OPENAI_MODEL || undefined})
    .listen(port, "127.0.0.1", () => console.log(`MusicTheory: http://127.0.0.1:${port}/`));
}
