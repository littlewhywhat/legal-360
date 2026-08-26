import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoPlayer } from "@/components/demo/DemoPlayer";
import { cases, getCase } from "@/lib/cases";

export function generateStaticParams() {
  return cases.map((c) => ({ case: c.meta.id }));
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ case: string }>;
}) {
  const { case: caseId } = await params;
  const demoCase = getCase(caseId);
  if (!demoCase) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <header className="px-4 pt-8 text-center">
        <p className="text-xs text-[var(--stage-muted)]">
          <Link href="/" className="underline-offset-2 hover:underline">
            All demos
          </Link>
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--stage-fg)] sm:text-4xl">
          {demoCase.meta.title}
        </p>
        <p className="mt-2 text-sm text-[var(--stage-muted)]">
          {demoCase.meta.tagline}
        </p>
      </header>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--stage-muted)]">
            Loading demo…
          </div>
        }
      >
        <DemoPlayer demoCase={demoCase} />
      </Suspense>
    </main>
  );
}
