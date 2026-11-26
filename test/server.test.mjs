import assert from "node:assert/strict";
import {once} from "node:events";
import test from "node:test";
import {createApp} from "../server.mjs";

async function runApp(t, options) {
  const server = createApp(options).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {origin, endpoint: `${origin}/api/arrangements`};
}

function post(url, origin, prompt = "Two short candidates") {
  return fetch(url, {method: "POST", headers: {Origin: origin, "Content-Type": "application/json"}, body: JSON.stringify({prompt})});
}

test("keeps the key server-side, rejects cross-origin calls and filters upstream responses", async t => {
  let calls = 0;
  const reply = {candidates: [{name: "Sparse", summary: "", sources: [], tracks: [
    {name: "Bass", notes: []}, {name: "Drums", notes: []}, {name: "Pad", notes: []}
  ]}]};
  const {endpoint, origin} = await runApp(t, {
    apiKey: "test-key",
    fetchOpenAI: async (url, request) => {
      calls++;
      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.equal(request.headers.Authorization, "Bearer test-key");
      const body = JSON.parse(request.body);
      assert.equal(body.input, "Two short candidates");
      assert.equal(body.store, false);
      assert.equal(body.model, "gpt-6.2-astra");
      assert.equal(body.text.format.strict, true);
      return Response.json({status: "completed", output: [
        {type: "reasoning"},
        {type: "message", content: [{type: "output_text", text: JSON.stringify(reply)}]}
      ]});
    }
  });

  assert.deepEqual(await (await fetch(endpoint)).json(), {available: true});
  assert.equal((await fetch(`${origin}/server.mjs`)).status, 404);
  assert.equal((await post(endpoint, "https://other.example")).status, 403);
  assert.equal((await post(endpoint, origin, "")).status, 400);
  assert.equal(calls, 0);
  const response = await post(endpoint, origin);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), reply);
  assert.equal(calls, 1);
});

test("a missing key disables API generation without blocking manual mode", async t => {
  const {endpoint, origin} = await runApp(t);
  assert.equal((await fetch(origin)).status, 200);
  assert.deepEqual(await (await fetch(endpoint)).json(), {available: false});
  assert.equal((await post(endpoint, origin)).status, 503);
});

test("upstream rejection and incomplete generation return errors, not candidates", async t => {
  const replies = [
    new Response("upstream details", {status: 429}),
    Response.json({status: "incomplete", output: []}),
    Response.json({status: "completed", output: [{type: "message", content: [{type: "refusal", refusal: "reason"}]}]})
  ];
  const {endpoint, origin} = await runApp(t, {apiKey: "test-key", fetchOpenAI: async () => replies.shift()});
  for (const [status, expected] of [[502, "HTTP 429"], [502, "did not complete"], [422, "declined"]]) {
    const response = await post(endpoint, origin);
    assert.equal(response.status, status);
    assert.ok((await response.json()).error.includes(expected));
  }
});
