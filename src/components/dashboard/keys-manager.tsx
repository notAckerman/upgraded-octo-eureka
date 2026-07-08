"use client";

import { useState, useTransition } from "react";
import { createApiKey, revokeApiKey } from "@/server/actions/keys";
import { Copy, Check, KeyRound, Plus, X } from "lucide-react";

interface KeyRow {
  id: string;
  name: string;
  prefix: string;
  rpm: number;
  revoked: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function KeysManager({
  keys,
  labels,
}: {
  keys: KeyRow[];
  labels: {
    createKey: string;
    keyName: string;
    revokeKey: string;
    keyCreated: string;
    emptyKeys: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name.trim());
      const res = await createApiKey(fd);
      if ("error" in res && res.error) {
        setError(
          res.error === "limit"
            ? "Достигнут лимит в 10 активных ключей"
            : "Не удалось создать ключ",
        );
        return;
      }
      if ("fullKey" in res && res.fullKey) {
        setNewKey(res.fullKey);
        setName("");
      }
    });
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      await revokeApiKey(id);
    });
  }

  async function handleCopy() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-[var(--text)]">
          Ключи
        </h1>
        <button
          onClick={() => {
            setOpen(true);
            setNewKey(null);
            setError(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-ink)] transition-all hover:opacity-90 active:translate-y-px"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {labels.createKey}
        </button>
      </div>

      {open && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          {newKey ? (
            <div>
              <p className="mb-3 text-sm text-[var(--muted)]">
                {labels.keyCreated}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--text)]">
                  {newKey}
                </code>
                <button
                  onClick={handleCopy}
                  aria-label="Скопировать ключ"
                  className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setNewKey(null);
                }}
                className="mt-4 text-sm text-[var(--muted)] underline-offset-2 hover:underline"
              >
                Готово
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="key-name"
                  className="text-sm font-medium text-[var(--text)]"
                >
                  {labels.keyName}
                </label>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  className="text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  id="key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.nativeEvent.isComposing &&
                      e.keyCode !== 229
                    )
                      handleCreate();
                  }}
                  maxLength={64}
                  placeholder="Например: production"
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={handleCreate}
                  disabled={pending || !name.trim()}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-ink)] disabled:opacity-50"
                >
                  {pending ? "…" : labels.createKey}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {keys.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted)]">{labels.emptyKeys}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium text-[var(--muted)]">
                  Название
                </th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">
                  Ключ
                </th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">
                  RPM
                </th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">
                  Последнее использование
                </th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">
                  Создан
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text)]">
                    <span className="inline-flex items-center gap-2">
                      <KeyRound
                        className="h-3.5 w-3.5 text-[var(--muted)]"
                        aria-hidden
                      />
                      {k.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--muted)]">
                    {k.prefix}
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--muted)]">
                    {k.rpm}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {formatDate(k.lastUsedAt)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {formatDate(k.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {k.revoked ? (
                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)]">
                        Отозван
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        disabled={pending}
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-red-500/50 hover:text-red-500 disabled:opacity-50"
                      >
                        {labels.revokeKey}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
