import Link from "next/link";
import { cases } from "@/lib/cases";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-10">
      <header className="text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--stage-fg)] sm:text-4xl">
          Demo cases
        </p>
        <p className="mt-2 text-sm text-[var(--stage-muted)]">
          Shared story engine — pick a case to tap through
        </p>
      </header>
      <ul className="mt-10 space-y-3">
        {cases.map((c) => (
          <li key={c.meta.id}>
            <Link
              href={`/${c.meta.id}`}
              className="block rounded-xl border border-[var(--stage-fg)]/10 bg-[var(--stage-fg)]/[0.03] px-5 py-4 transition-colors hover:bg-[var(--stage-fg)]/[0.06]"
            >
              <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--stage-fg)]">
                {c.meta.title}
              </div>
              <p className="mt-1 text-sm text-[var(--stage-muted)]">
                {c.meta.tagline}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
