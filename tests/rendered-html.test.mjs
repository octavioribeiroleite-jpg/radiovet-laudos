import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the RadioVet library", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>RadioVet \| Auxiliador de laudos radiográficos<\/title>/i);
  assert.match(html, /218 FICHAS \+ CONTEXTO THRALL/);
  assert.match(html, /Abrir guia de interpretação/);
  assert.match(html, /Modelo \+ contexto Thrall/);
  assert.match(html, /Hidrocefalia/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the report model unified and the Thrall context available", async () => {
  const [page, context] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/thrall-context.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /className="full-model-editor"/);
  assert.match(page, /Relatório, impressões e comentários/);
  assert.doesNotMatch(page, /value=\{description\}|value=\{impression\}|value=\{comment\}/);
  assert.match(page, /getThrallContext/);
  assert.match(page, /thrallStudyGuides/);
  assert.match(page, /className="disclosure-button"/);
  assert.match(page, /aria-expanded=\{/);
  assert.match(context, /Método de interpretação/);
  assert.match(context, /Lesões ósseas e agressividade/);
  assert.match(context, /Padrões pulmonares/);
  assert.match(context, /Leitura sistemática do abdômen/);
});
