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

export function createApp({apiKey, model = "gpt-6-luna", fetchOpenAI = fetch} = {}) {
  return createServer({requestTimeout: 60_000, headersTimeout: 65_000}, async (req, res) => {
    const port = req.socket.localPort;
    const host = req.headers.host;
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) {
      return json(res, 403, {error: "Use the local sketchpad address."});
    }
    const path = req.url.split("?")[0];
    if (path === ENDPOINT && req.method === "GET") return json(res, 200, {available: Boolean(apiKey), model});
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
            model, input: prompt, store: false, max_output_tokens: 16000,
            text: {format: {type: "json_schema", name: "arrangement_candidates", strict: true, schema: candidateSchema}}
          }),
          signal: AbortSignal.timeout(120_000)
        });
        if (!response.ok) {
          let detail = "";
          try {
            const body = await response.json();
            detail = body.error?.message || body.message || "";
          } catch {}
          console.error("OpenAI API error", response.status, detail.slice(0, 500));
          return json(res, 502, {error: detail ? `OpenAI API (${response.status}): ${detail}` : `OpenAI API returned HTTP ${response.status}. Check the API key, model access and billing quota.`});
        }
        const result = await response.json();
        if (result.status !== "completed") {
          const reason = result.incomplete_details?.reason || result.status || "unknown";
          console.error("OpenAI arrangement incomplete", result.id, reason);
          return json(res, 502, {error: `生成が完了しませんでした（${reason}）。ノート数の多いトラックは一時的に減らすか、指示を短くしてください。`});
        }
        const content = result.output.filter(item => item.type === "message").flatMap(item => item.content);
        if (content.some(item => item.type === "refusal")) {
          return json(res, 422, {error: "OpenAI declined the request. Try a different arrangement description."});
        }
        const text = content.filter(item => item.type === "output_text").map(item => item.text).join("");
        return json(res, 200, JSON.parse(text));
      } catch (error) {
        const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
        console.error("OpenAI arrangement request failed", error.name, error.message);
        return json(res, timedOut ? 504 : 502, {error: timedOut ? "AI応答が120秒でタイムアウトしました。入力を短くするか、もう一度試してください。" : `AI応答の処理に失敗しました: ${error.message}`});
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
  const requestedPort = Number(process.env.PORT || 8000);
  const options = {apiKey: process.env.OPENAI_API_KEY?.trim(), model: process.env.OPENAI_MODEL || undefined};

  async function start() {
    for (let port = requestedPort; port < requestedPort + 10; port++) {
      const server = createApp(options);
      try {
        await new Promise((resolve, reject) => {
          const onError = error => {
            server.off("listening", onListening);
            reject(error);
          };
          const onListening = () => {
            server.off("error", onError);
            resolve();
          };
          server.once("error", onError);
          server.once("listening", onListening);
          server.listen(port, "127.0.0.1");
        });
        console.log(`MusicTheory: http://127.0.0.1:${port}/`);
        if (port !== requestedPort) {
          console.log(`Port ${requestedPort} was busy; using ${port} instead.`);
        }
        return;
      } catch (error) {
        if (error.code !== "EADDRINUSE") throw error;
      }
    }
    throw new Error(`Ports ${requestedPort}–${requestedPort + 9} are all in use. Stop another process or set PORT to a free port.`);
  }

  start().catch(error => {
    console.error(`MusicTheory could not start: ${error.message}`);
    process.exitCode = 1;
  });
}
