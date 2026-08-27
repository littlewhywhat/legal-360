"use client";

import { useState, type ReactNode } from "react";
import type { Choice } from "@demo/runtime";

type HomePayload = {
  mode: "home";
  status: {
    equity: string;
    deposits: string;
    cashouts: string;
    pnl: string;
    formula: string;
  };
  goal: {
    coverage: string;
    coveragePct: number;
    hitDate: string;
    label: string;
  };
  opportunity: {
    ticker: string;
    sleeve: string;
    headline: string;
    sub: string;
  };
  defense?: { ticker: string; text: string };
};

type DossierPayload = {
  mode: "dossier";
  ticker: string;
  name: string;
  sleeve: string;
  print: { who: string; code: string; size: string; when: string };
  memo: string[];
  buyers: { label: string; detail: string }[];
};

type VerdictPayload = {
  mode: "verdict";
  ticker: string;
  ceo: string;
  mission: string;
  hypothesis: {
    r: string;
    g: string;
    spread: string;
    months: string;
    leftover: string;
    caveat: string;
  };
};

type AppPayload = HomePayload | DossierPayload | VerdictPayload;

export function AppScene({
  payload,
  choices,
  onChoice,
  onAdvance,
}: {
  payload: AppPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
}) {
  if (payload.mode === "home") {
    return <Home payload={payload} onAdvance={onAdvance} />;
  }
  if (payload.mode === "dossier") {
    return <Dossier payload={payload} onAdvance={onAdvance} />;
  }
  return <Verdict payload={payload} choices={choices} onChoice={onChoice} />;
}

function Shell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0c1210] text-[#e7f0ea]">
      <header className="shrink-0 border-b border-white/8 px-4 pb-2 pt-1">
        <div className="text-[10px] uppercase tracking-[0.16em] text-[#7d9a8c]">
          Investing OS
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </header>
      {children}
    </div>
  );
}

function Home({
  payload,
  onAdvance,
}: {
  payload: HomePayload;
  onAdvance?: () => void;
}) {
  return (
    <Shell title="Today">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <section className="rounded-xl bg-[#141c19] p-3 ring-1 ring-white/8">
          <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
            Status · economic P&L
          </div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#6ee7b7]">
            {payload.status.pnl}
          </div>
          <p className="mt-1 text-[11px] text-[#9ab0a5]">
            {payload.status.formula} · equity {payload.status.equity}
          </p>
          <p className="text-[11px] text-[#6b8077]">
            in {payload.status.deposits} · out {payload.status.cashouts}
          </p>
        </section>
        <section className="rounded-xl bg-[#141c19] p-3 ring-1 ring-white/8">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
              {payload.goal.label}
            </div>
            <div className="text-[11px] text-[#9ab0a5]">{payload.goal.hitDate}</div>
          </div>
          <div className="mt-1 text-lg font-semibold">{payload.goal.coverage}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#34d399]"
              style={{ width: `${payload.goal.coveragePct}%` }}
            />
          </div>
        </section>
        {payload.defense ? (
          <div className="rounded-lg bg-[#141c19] px-3 py-2 text-[11px] text-[#9ab0a5] ring-1 ring-white/8">
            <span className="font-semibold text-[#d5e4dc]">
              {payload.defense.ticker}
            </span>{" "}
            {payload.defense.text}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onAdvance}
          className="animate-slide-up rounded-xl bg-[#1b3d32] p-3 text-left ring-1 ring-[#34d399]/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{payload.opportunity.ticker}</span>
            <span className="rounded bg-[#34d399]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6ee7b7]">
              {payload.opportunity.sleeve}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-[#d5e4dc]">
            {payload.opportunity.headline}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7d9a8c]">
            {payload.opportunity.sub}
          </div>
        </button>
      </div>
    </Shell>
  );
}

function Dossier({
  payload,
  onAdvance,
}: {
  payload: DossierPayload;
  onAdvance?: () => void;
}) {
  return (
    <Shell title={payload.ticker}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div>
            <div className="text-sm font-semibold">{payload.name}</div>
            <div className="text-[11px] text-[#7d9a8c]">{payload.sleeve}</div>
          </div>
          <section className="rounded-xl bg-[#141c19] p-3 ring-1 ring-white/8">
            <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
              Form 4
            </div>
            <div className="mt-1 text-[13px]">
              {payload.print.who} · {payload.print.code} · {payload.print.size}
            </div>
            <div className="text-[11px] text-[#7d9a8c]">{payload.print.when}</div>
          </section>
          <section className="rounded-xl bg-[#141c19] p-3 ring-1 ring-white/8">
            <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
              Memo
            </div>
            {payload.memo.map((line) => (
              <p key={line} className="mt-1 text-[12px] leading-snug text-[#d5e4dc]">
                {line}
              </p>
            ))}
          </section>
          <section className="rounded-xl bg-[#141c19] p-3 ring-1 ring-white/8">
            <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
              Other buyers
            </div>
            <ul className="mt-1 space-y-1.5">
              {payload.buyers.map((b) => (
                <li key={b.label} className="text-[12px]">
                  <span className="font-semibold">{b.label}</span>
                  <span className="text-[#9ab0a5]"> — {b.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        {onAdvance ? (
          <div className="border-t border-white/8 p-3">
            <button
              type="button"
              onClick={onAdvance}
              className="w-full rounded-lg bg-[#2bac76] py-2.5 text-sm font-semibold text-[#052e1c] active:scale-[0.98]"
            >
              CEO / mission
            </button>
          </div>
        ) : null}
      </div>
    </Shell>
  );
}

function Verdict({
  payload,
  choices,
  onChoice,
}: {
  payload: VerdictPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
}) {
  const [liked, setLiked] = useState(false);
  const like = choices?.find((c) => c.id === "like");
  const skip = choices?.find((c) => c.id === "skip");

  return (
    <Shell title={`${payload.ticker} · verdict`}>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <div className="flex-1 space-y-3 overflow-y-auto">
          <section className="rounded-xl bg-[#141c19] p-3 ring-1 ring-white/8">
            <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
              CEO / mission
            </div>
            <div className="mt-1 text-sm font-semibold">{payload.ceo}</div>
            <p className="mt-1 text-[12px] leading-snug text-[#d5e4dc]">
              {payload.mission}
            </p>
          </section>
          {liked ? (
            <section className="animate-slide-up rounded-xl bg-[#1b3d32] p-3 ring-1 ring-[#34d399]/30">
              <div className="text-[10px] uppercase tracking-wider text-[#6ee7b7]">
                Hypothesis · not an order
              </div>
              <p className="mt-1 text-[13px]">
                Borrow at {payload.hypothesis.r} vs assumed {payload.hypothesis.g} →{" "}
                {payload.hypothesis.spread}
              </p>
              <p className="mt-1 text-[12px] text-[#9ab0a5]">
                {payload.hypothesis.months}. {payload.hypothesis.leftover}
              </p>
              <p className="mt-2 text-[11px] text-[#7d9a8c]">
                {payload.hypothesis.caveat}
              </p>
            </section>
          ) : null}
        </div>
        <div className="mt-3 space-y-2">
          {!liked ? (
            <div className="flex gap-2">
              {like ? (
                <button
                  type="button"
                  onClick={() => setLiked(true)}
                  className="flex-1 rounded-lg bg-[#2bac76] py-2.5 text-sm font-semibold text-[#052e1c] active:scale-[0.98]"
                >
                  {like.label}
                </button>
              ) : null}
              {skip ? (
                <button
                  type="button"
                  onClick={() => onChoice(skip)}
                  className="flex-1 rounded-lg bg-white/8 py-2.5 text-sm font-semibold text-[#d5e4dc] ring-1 ring-white/10 active:scale-[0.98]"
                >
                  {skip.label}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => like && onChoice(like)}
                className="flex-1 rounded-lg bg-[#2bac76] py-2.5 text-sm font-semibold text-[#052e1c] active:scale-[0.98]"
              >
                Confirm card
              </button>
              <button
                type="button"
                onClick={() => skip && onChoice(skip)}
                className="flex-1 rounded-lg bg-white/8 py-2.5 text-sm font-semibold text-[#d5e4dc] ring-1 ring-white/10"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
