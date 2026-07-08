import { highlight } from "@/lib/highlight";
import { LiveExampleClient, type SnippetMap } from "./live-example-client";

const RAW: SnippetMap = {
  openai: {
    curl: `curl uzel.dev/api/v1/chat/completions \\
  -H "Authorization: Bearer $UZEL_KEY" \\
  -d '{
    "model": "claude-sonnet-4-6",
    "stream": true,
    "messages": [{"role":"user","content":"Привет!"}]
  }'`,
    JavaScript: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://uzel.dev/api/v1",
  apiKey: process.env.UZEL_KEY,
});

const stream = await client.chat.completions.create({
  model: "claude-sonnet-4-6",
  stream: true,
  messages: [{ role: "user", content: "Привет!" }],
});`,
    Python: `from openai import OpenAI

client = OpenAI(
    base_url="https://uzel.dev/api/v1",
    api_key=os.environ["UZEL_KEY"],
)

stream = client.chat.completions.create(
    model="claude-sonnet-4-6",
    stream=True,
    messages=[{"role": "user", "content": "Привет!"}],
)`,
  },
  anthropic: {
    curl: `curl uzel.dev/api/v1/messages \\
  -H "x-api-key: $UZEL_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 1024,
    "stream": true,
    "messages": [{"role":"user","content":"Привет!"}]
  }'`,
    JavaScript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "https://uzel.dev/api/v1",
  apiKey: process.env.UZEL_KEY,
});

const stream = client.messages.stream({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Привет!" }],
});
stream.on("text", (t) => process.stdout.write(t));`,
    Python: `from anthropic import Anthropic

client = Anthropic(
    base_url="https://uzel.dev/api/v1",
    api_key=os.environ["UZEL_KEY"],
)

with client.messages.stream(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Привет!"}],
) as stream:
    for text in stream.text_stream:
        print(text, end="")`,
  },
};

const LANG_OF: Record<string, "bash" | "javascript" | "python"> = {
  curl: "bash",
  JavaScript: "javascript",
  Python: "python",
};

export async function LiveExample() {
  const entries = await Promise.all(
    (["openai", "anthropic"] as const).map(async (fmt) => {
      const langs = await Promise.all(
        Object.keys(RAW[fmt]).map(async (l) => [
          l,
          await highlight(RAW[fmt][l], LANG_OF[l]),
        ]),
      );
      return [fmt, Object.fromEntries(langs)] as const;
    }),
  );
  const highlighted = Object.fromEntries(entries) as SnippetMap;

  return <LiveExampleClient snippets={RAW} highlighted={highlighted} />;
}
