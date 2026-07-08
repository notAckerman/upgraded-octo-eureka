"use client";

import { useState, useTransition } from "react";
import { createTicket, replyToTicket } from "@/server/actions/tickets";
import { MessageSquare, Plus, X } from "lucide-react";

interface TicketMsg {
  id: string;
  fromRole: string;
  body: string;
  createdAt: string;
}

interface TicketRow {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  messages: TicketMsg[];
}

const CATEGORY_LABELS: Record<string, string> = {
  billing: "Оплата",
  api: "API",
  other: "Другое",
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "Открыт", cls: "text-amber-500 border-amber-500/40" },
  ANSWERED: { label: "Отвечен", cls: "text-emerald-500 border-emerald-500/40" },
  CLOSED: { label: "Закрыт", cls: "text-[var(--muted)] border-[var(--border)]" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SupportTickets({ tickets }: { tickets: TicketRow[] }) {
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTicket(fd);
      if ("ok" in res && res.ok) setCreating(false);
    });
  }

  function handleReply(ticketId: string) {
    if (!reply.trim()) return;
    const fd = new FormData();
    fd.set("ticketId", ticketId);
    fd.set("body", reply.trim());
    startTransition(async () => {
      const res = await replyToTicket(fd);
      if ("ok" in res && res.ok) setReply("");
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-[var(--text)]">
          Поддержка
        </h1>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-ink)] transition-all hover:opacity-90 active:translate-y-px"
        >
          {creating ? (
            <X className="h-4 w-4" aria-hidden />
          ) : (
            <Plus className="h-4 w-4" aria-hidden />
          )}
          {creating ? "Отмена" : "Новое обращение"}
        </button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="mb-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div>
              <label
                htmlFor="ticket-subject"
                className="mb-1.5 block text-sm font-medium text-[var(--text)]"
              >
                Тема
              </label>
              <input
                id="ticket-subject"
                name="subject"
                required
                minLength={3}
                maxLength={120}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label
                htmlFor="ticket-category"
                className="mb-1.5 block text-sm font-medium text-[var(--text)]"
              >
                Категория
              </label>
              <select
                id="ticket-category"
                name="category"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              >
                <option value="billing">Оплата</option>
                <option value="api">API</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="ticket-body"
              className="mb-1.5 block text-sm font-medium text-[var(--text)]"
            >
              Сообщение
            </label>
            <textarea
              id="ticket-body"
              name="body"
              required
              minLength={5}
              maxLength={4000}
              rows={4}
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-ink)] disabled:opacity-50"
          >
            {pending ? "Отправка…" : "Отправить"}
          </button>
        </form>
      )}

      {tickets.length === 0 && !creating ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted)]">
            Создайте обращение, если нужна помощь.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const status = STATUS_LABELS[t.status] ?? STATUS_LABELS.OPEN;
            const isOpen = expanded === t.id;
            return (
              <div
                key={t.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare
                      className="h-4 w-4 shrink-0 text-[var(--muted)]"
                      aria-hidden
                    />
                    <span>
                      <span className="block text-sm font-medium text-[var(--text)]">
                        {t.subject}
                      </span>
                      <span className="block text-xs text-[var(--muted)]">
                        {CATEGORY_LABELS[t.category] ?? t.category} ·{" "}
                        {formatDateTime(t.createdAt)}
                      </span>
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${status.cls}`}
                  >
                    {status.label}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--border)] px-5 py-4">
                    <div className="space-y-3">
                      {t.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${
                            m.fromRole === "ADMIN"
                              ? "border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                              : "ml-auto bg-[var(--accent)]/10 text-[var(--text)]"
                          }`}
                        >
                          <p className="mb-1 text-xs text-[var(--muted)]">
                            {m.fromRole === "ADMIN" ? "Поддержка" : "Вы"} ·{" "}
                            {formatDateTime(m.createdAt)}
                          </p>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                        </div>
                      ))}
                    </div>

                    {t.status !== "CLOSED" && (
                      <div className="mt-4 flex gap-2">
                        <input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !e.nativeEvent.isComposing &&
                              e.keyCode !== 229
                            )
                              handleReply(t.id);
                          }}
                          placeholder="Ваш ответ…"
                          aria-label="Ответ в тикет"
                          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                        <button
                          onClick={() => handleReply(t.id)}
                          disabled={pending || !reply.trim()}
                          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-ink)] disabled:opacity-50"
                        >
                          Отправить
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
