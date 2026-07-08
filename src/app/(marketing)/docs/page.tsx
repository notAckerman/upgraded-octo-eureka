import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CopyButton } from "@/components/common/copy-button";
import { highlight } from "@/lib/highlight";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("docs");
  return { title: t("title") };
}

function CodeBlock({ code, html }: { code: string; html: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/50">
      <CopyButton value={code} className="absolute right-2 top-2 z-10" />
      <div
        className="overflow-x-auto p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

const CURL = `curl ${site.domain}/api/v1/chat/completions \\
  -H "Authorization: Bearer $UZEL_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "Привет!"}]
  }'`;

const JS = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${site.domain}/api/v1",
  apiKey: process.env.UZEL_KEY,
});

const res = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Привет!" }],
});
console.log(res.choices[0].message.content);`;

const ANTHROPIC = `curl ${site.domain}/api/v1/messages \\
  -H "x-api-key: $UZEL_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Привет!"}]
  }'`;

const MODELS = `curl ${site.domain}/api/v1/models \\
  -H "Authorization: Bearer $UZEL_KEY"`;

export default async function DocsPage() {
  const t = await getTranslations("docs");
  const [curlHtml, jsHtml, anthropicHtml, modelsHtml] = await Promise.all([
    highlight(CURL, "bash"),
    highlight(JS, "javascript"),
    highlight(ANTHROPIC, "bash"),
    highlight(MODELS, "bash"),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h1>{t("title")}</h1>
      <p className="mt-4 text-lg text-[var(--muted)]">{t("intro")}</p>

      <section className="mt-14">
        <h2 className="text-2xl">{t("quickstartTitle")}</h2>
        <p className="mt-3 text-[var(--muted)]">
          Base URL:{" "}
          <code className="font-mono text-[var(--text)]">
            {site.domain}/api/v1
          </code>
          . {t("quickstartBody")}
        </p>
        <div className="mt-6 space-y-4">
          <CodeBlock code={CURL} html={curlHtml} />
          <CodeBlock code={JS} html={jsHtml} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">{t("anthropicTitle")}</h2>
        <p className="mt-3 text-[var(--muted)]">{t("anthropicBody")}</p>
        <div className="mt-6">
          <CodeBlock code={ANTHROPIC} html={anthropicHtml} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">{t("modelsTitle")}</h2>
        <p className="mt-3 text-[var(--muted)]">{t("modelsBody")}</p>
        <div className="mt-6">
          <CodeBlock code={MODELS} html={modelsHtml} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">{t("streamTitle")}</h2>
        <p className="mt-3 text-[var(--muted)]">{t("streamBody")}</p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">{t("errorsTitle")}</h2>
        <p className="mt-3 text-[var(--muted)]">{t("errorsBody")}</p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
          <li>
            <code className="font-mono text-[var(--text)]">401</code> —{" "}
            {t("err401")}
          </li>
          <li>
            <code className="font-mono text-[var(--text)]">402</code> —{" "}
            {t("err402")}
          </li>
          <li>
            <code className="font-mono text-[var(--text)]">429</code> —{" "}
            {t("err429")}
          </li>
        </ul>
      </section>
    </article>
  );
}
