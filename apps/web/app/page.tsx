import { Suspense } from "react";
import { DemoPlayer } from "@/components/demo/DemoPlayer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="px-4 pt-8 text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--stage-fg)] sm:text-4xl">
          Legal 360
        </p>
        <p className="mt-2 text-sm text-[var(--stage-muted)]">
          Preferred auto flow — tap through the phone storyboard
        </p>
      </header>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--stage-muted)]">
            Loading demo…
          </div>
        }
      >
        <DemoPlayer />
      </Suspense>
    </main>
  );
}
