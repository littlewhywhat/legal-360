"use client";

import { useState, type ReactNode } from "react";

type Holding = {
  ticker: string;
  name: string;
  value: string;
  change: string;
  then: string;
};

type Signal = {
  ticker: string;
  name: string;
  blurb: string;
  ping: boolean;
};

type Tabs = { home: string; hot: string; goals: string };

type Shared = {
  tabs: Tabs;
  status: { pnl: string; equity: string };
  holdings: Holding[];
  candidate: Holding;
  signals: Signal[];
};

type HotPayload = Shared & {
  mode: "hot";
  activeTab: "hot";
  dossierScene: string;
};

type HomePayload = Shared & {
  mode: "home";
  activeTab: "home";
  dossierScene: string;
};

type GoalsPayload = Shared & {
  mode: "goals";
  activeTab: "goals";
  horizon: string;
  totalNow: string;
  totalThen: string;
  totalThenWithCandidate: string;
};

type DossierPayload = Shared & {
  mode: "dossier";
  activeTab: "hot";
  ticker: string;
  name: string;
  print: { who: string; code: string; size: string; when: string };
  memo: string[];
  buyers: { label: string; detail: string }[];
  ceo: { name: string; blurb: string };
};

type AppPayload = HotPayload | HomePayload | GoalsPayload | DossierPayload;

export function AppScene({
  payload,
  onGo,
}: {
  payload: AppPayload;
  onGo: (sceneId: string) => void;
}) {
  const [added, setAdded] = useState(false);

  return (
    <Shell
      title={titleFor(payload)}
      tab={payload.activeTab}
      tabs={payload.tabs}
      onTab={onGo}
      back={
        payload.mode === "dossier"
          ? () => onGo(payload.tabs.hot)
          : undefined
      }
    >
      {payload.mode === "hot" ? (
        <Hot
          payload={payload}
          added={added}
          onOpen={() => onGo(payload.dossierScene)}
          onAdd={() => {
            setAdded(true);
            onGo(payload.tabs.home);
          }}
        />
      ) : null}
      {payload.mode === "home" ? (
        <Home
          payload={payload}
          added={added}
          onOpenTicker={(ticker) => {
            if (ticker === payload.candidate.ticker) onGo(payload.dossierScene);
          }}
        />
      ) : null}
      {payload.mode === "goals" ? (
        <Goals payload={payload} added={added} />
      ) : null}
      {payload.mode === "dossier" ? (
        <Dossier
          payload={payload}
          added={added}
          onAdd={() => {
            setAdded(true);
            onGo(payload.tabs.home);
          }}
        />
      ) : null}
    </Shell>
  );
}

function titleFor(payload: AppPayload): string {
  if (payload.mode === "dossier") return payload.ticker;
  if (payload.mode === "hot") return "Hot";
  if (payload.mode === "goals") return "Goals";
  return "Home";
}

function Shell({
  children,
  title,
  tab,
  tabs,
  onTab,
  back,
}: {
  children: ReactNode;
  title: string;
  tab: "home" | "hot" | "goals";
  tabs: Tabs;
  onTab: (id: string) => void;
  back?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0c1210] text-[#e7f0ea]">
      <header className="flex shrink-0 items-center gap-2 border-b border-white/8 px-3 pb-2 pt-1">
        {back ? (
          <button
            type="button"
            onClick={back}
            className="px-1 text-lg leading-none text-[#7d9a8c]"
          >
            ‹
          </button>
        ) : null}
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#7d9a8c]">
            Investing OS
          </div>
          <div className="text-sm font-semibold">{title}</div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      <nav className="grid grid-cols-3 border-t border-white/8 bg-[#0c1210] pb-1 pt-1">
        {(
          [
            ["home", "Home", tabs.home],
            ["hot", "Hot", tabs.hot],
            ["goals", "Goals", tabs.goals],
          ] as const
        ).map(([id, label, scene]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(scene)}
            className={[
              "py-2 text-[11px] font-semibold",
              tab === id ? "text-[#6ee7b7]" : "text-[#6b8077]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Hot({
  payload,
  added,
  onOpen,
  onAdd,
}: {
  payload: HotPayload;
  added: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const rows = payload.signals.filter((s) => {
    if (!needle) return true;
    return (
      s.ticker.toLowerCase().includes(needle) ||
      s.name.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="flex h-full flex-col px-4 py-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search tickers"
        className="w-full rounded-lg bg-[#141c19] px-3 py-2 text-[13px] text-[#e7f0ea] outline-none ring-1 ring-white/10 placeholder:text-[#6b8077]"
      />
      <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {rows.map((s) => {
          const isCandidate = s.ticker === payload.candidate.ticker;
          return (
            <li key={s.ticker}>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={isCandidate ? onOpen : undefined}
                  className={[
                    "flex-1 rounded-xl p-3 text-left ring-1",
                    s.ping
                      ? "bg-[#1b3d32] ring-[#34d399]/30"
                      : "bg-[#141c19] ring-white/8",
                    isCandidate ? "" : "opacity-90",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{s.ticker}</span>
                    {s.ping ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6ee7b7]">
                        ping
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[#9ab0a5]">{s.blurb}</div>
                </button>
                {isCandidate && !added ? (
                  <button
                    type="button"
                    onClick={onAdd}
                    className="shrink-0 rounded-xl bg-[#2bac76] px-3 text-xs font-semibold text-[#052e1c]"
                  >
                    Add
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="px-1 py-6 text-center text-[12px] text-[#6b8077]">
            No names — try BYRN
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function Home({
  payload,
  added,
  onOpenTicker,
}: {
  payload: HomePayload;
  added: boolean;
  onOpenTicker: (ticker: string) => void;
}) {
  const rows = added
    ? [...payload.holdings, payload.candidate]
    : payload.holdings;
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-3">
      <section className="rounded-xl bg-[#141c19] p-3 ring-1 ring-white/8">
        <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
          Status
        </div>
        <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#6ee7b7]">
          {payload.status.pnl}
        </div>
        <div className="text-[11px] text-[#9ab0a5]">{payload.status.equity}</div>
      </section>
      <ul className="space-y-2">
        {rows.map((h) => (
          <li key={h.ticker}>
            <button
              type="button"
              onClick={() => onOpenTicker(h.ticker)}
              className="flex w-full items-center justify-between rounded-xl bg-[#141c19] px-3 py-2.5 text-left ring-1 ring-white/8"
            >
              <div>
                <div className="text-sm font-semibold">{h.ticker}</div>
                <div className="text-[11px] text-[#7d9a8c]">{h.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{h.value}</div>
                <div
                  className={
                    h.change.startsWith("−") || h.change.startsWith("-")
                      ? "text-[11px] text-[#fca5a5]"
                      : "text-[11px] text-[#6ee7b7]"
                  }
                >
                  {h.change}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Goals({ payload, added }: { payload: GoalsPayload; added: boolean }) {
  const rows = added
    ? [...payload.holdings, payload.candidate]
    : payload.holdings;
  const then = added ? payload.totalThenWithCandidate : payload.totalThen;
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
            Book at assumed prices
          </div>
          <div className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {then}
          </div>
        </div>
        <div className="text-sm text-[#9ab0a5]">{payload.horizon}</div>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-1 text-[10px] uppercase tracking-wider text-[#6b8077]">
        <span>Name</span>
        <span>Now</span>
        <span>Then</span>
      </div>
      <ul className="space-y-1.5">
        {rows.map((h) => (
          <li
            key={h.ticker}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-lg bg-[#141c19] px-3 py-2 text-[13px] ring-1 ring-white/8"
          >
            <span className="font-semibold">{h.ticker}</span>
            <span className="text-[#9ab0a5]">{h.value}</span>
            <span>{h.then}</span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 text-[12px] font-semibold">
        <span>Total</span>
        <span className="text-[#9ab0a5]">{payload.totalNow}</span>
        <span>{then}</span>
      </div>
    </div>
  );
}

function Dossier({
  payload,
  added,
  onAdd,
}: {
  payload: DossierPayload;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <div className="text-sm font-semibold">{payload.name}</div>
        <Card label="Form 4">
          {payload.print.who} · {payload.print.code} · {payload.print.size}
          <div className="mt-0.5 text-[11px] text-[#7d9a8c]">{payload.print.when}</div>
        </Card>
        <Card label="Memo">
          {payload.memo.map((line) => (
            <p key={line} className="mt-1 first:mt-0">
              {line}
            </p>
          ))}
        </Card>
        <Card label="Other buyers">
          <ul className="space-y-1">
            {payload.buyers.map((b) => (
              <li key={b.label}>
                <span className="font-semibold">{b.label}</span>
                <span className="text-[#9ab0a5]"> — {b.detail}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card label="CEO">
          <div className="font-semibold">{payload.ceo.name}</div>
          <p className="mt-1">{payload.ceo.blurb}</p>
        </Card>
      </div>
      <div className="border-t border-white/8 p-3">
        {added ? (
          <div className="py-2 text-center text-[12px] text-[#7d9a8c]">In portfolio</div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-lg bg-[#2bac76] py-2.5 text-sm font-semibold text-[#052e1c] active:scale-[0.98]"
          >
            Add to portfolio
          </button>
        )}
      </div>
    </div>
  );
}

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-[#141c19] p-3 text-[12px] leading-snug text-[#d5e4dc] ring-1 ring-white/8">
      <div className="text-[10px] uppercase tracking-wider text-[#7d9a8c]">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}
