import { getTranslations } from "next-intl/server";
import { providers } from "@/lib/site";

/**
 * Provider strip: the model families we route to. A capability list, not customer
 * social proof, so provider wordmarks are honest here.
 *
 * Seamless loop: two identical groups, each `shrink-0` with a trailing gap equal to
 * the internal gap, animated to -50%. The halfway point lands exactly on a group
 * boundary, so there is no jump on repeat.
 */
export async function ModelMarquee() {
  const t = await getTranslations("marquee");

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)]/30 py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        {t("label")}
      </p>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex shrink-0 items-center gap-14 pr-14"
              aria-hidden={copy === 1}
            >
              {providers.map((p) => (
                <li
                  key={`${copy}-${p}`}
                  className="font-heading text-xl font-semibold whitespace-nowrap text-[var(--muted)]/70 transition-colors hover:text-[var(--text)]"
                >
                  {p}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
