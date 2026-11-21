import assert from "node:assert/strict";
import test from "node:test";

import { buildQueryOptions, parseJSON } from "../src/llm.ts";

test("generation-only queries disable all built-in tools", () => {
  const options = buildQueryOptions({
    model: "claude-sonnet-4-5",
    systemPrompt: "Think divergently.",
    userPrompt: "Generate ideas.",
  });

  assert.deepEqual(options.tools, []);
  assert.equal("allowedTools" in options, false);
  assert.equal("permissionMode" in options, false);
});

test("parseJSON ignores prose after the JSON value", () => {
  assert.deepEqual(
    parseJSON('[{"text": "a"}]\n\nLet me know if you would like more ideas.'),
    [{ text: "a" }],
  );
});

test("parseJSON ignores trailing prose that itself contains brackets", () => {
  assert.deepEqual(
    parseJSON('{"label": "x"}\n\nNote: see [1] and {2} above.'),
    { label: "x" },
  );
});

test("parseJSON does not cut at brackets or escaped quotes inside strings", () => {
  assert.deepEqual(
    parseJSON('Here you go: {"text": "use a [cache] } and a \\"quote]\\""} Done.'),
    { text: 'use a [cache] } and a "quote]"' },
  );
});

test("parseJSON still rejects truncated JSON", () => {
  assert.throws(() => parseJSON('[{"text": "a"}, {"text": "b"'));
});
