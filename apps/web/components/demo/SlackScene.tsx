"use client";

import { useState } from "react";
import type { Choice } from "@/content/demo-script";

type Flag = {
  id: string;
  label: string;
  client: string;
  playbook: string;
  verdict: string;
};

type SlackPayload = {
  mode: "notification" | "actions" | "rejected" | "thread-reply";
  channel: string;
  bot: string;
  text?: string;
  docLink?: string;
  flags?: Flag[];
  phases?: { id: string; you?: string; botReply?: string; cta: string }[];
};

type SlackSceneProps = {
  payload: SlackPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
};

export function SlackScene({
  payload,
  choices,
  onChoice,
  onAdvance,
}: SlackSceneProps) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [sent, setSent] = useState(false);

  if (payload.mode === "notification") {
    return (
      <button
        type="button"
        onClick={onAdvance}
        className="flex h-full w-full flex-col bg-[#1a1d21] px-3 pt-2 text-left text-white"
      >
        <div className="mb-3 text-sm font-semibold tracking-wide text-[#d1d2d3]">
          Slack
        </div>
        <div className="animate-slide-up rounded-xl bg-[#222529] p-3 shadow-lg ring-1 ring-white/10">
          <div className="text-[10px] uppercase tracking-wider text-[#9a9b9e]">
            {payload.channel}
          </div>
          <div className="mt-1 text-xs font-semibold text-[#2bac76]">{payload.bot}</div>
          <p className="mt-1 text-[13px] leading-snug text-[#e8e8e8]">{payload.text}</p>
        </div>
      </button>
    );
  }

  if (payload.mode === "rejected") {
    return (
      <button
        type="button"
        onClick={onAdvance}
        className="flex h-full w-full flex-col bg-[#1a1d21] px-3 pt-2 text-left text-white"
      >
        <ChannelHeader channel={payload.channel} />
        <div className="mt-3 rounded-lg bg-[#2b1d1d] p-3 ring-1 ring-[#ef4444]/30">
          <div className="text-xs font-semibold text-[#f87171]">{payload.bot}</div>
          <p className="mt-1 text-[13px] text-[#f5f5f5]">{payload.text}</p>
        </div>
      </button>
    );
  }

  if (payload.mode === "thread-reply" && payload.phases) {
    const phase = payload.phases[Math.min(phaseIdx, payload.phases.length - 1)];
    const showBot = sent || phaseIdx > 0;
    const addChoice = choices?.find((c) => c.id === "add-suggestion");

    return (
      <div className="flex h-full flex-col bg-[#1a1d21] text-white">
        <div className="px-3 pt-2">
          <ChannelHeader channel={payload.channel} />
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
          <BotCard
            bot={payload.bot}
            body="Thread open on Helios MSA liability + governing law."
          />
          {(sent || phaseIdx >= 0) && phase.you ? (
            <div className="ml-6 rounded-lg bg-[#2a2d31] px-3 py-2 text-[13px] leading-snug text-[#e8e8e8]">
              <div className="text-[10px] font-semibold text-[#9a9b9e]">You</div>
              <p className="mt-0.5">{sent || phaseIdx > 0 ? phase.you : "…"}</p>
            </div>
          ) : null}
          {showBot && payload.phases[1]?.botReply ? (
            <div className="animate-slide-up">
              <BotCard bot={payload.bot} body={payload.phases[1].botReply} />
            </div>
          ) : null}
        </div>
        <div className="border-t border-white/10 p-3">
          {!sent ? (
            <button
              type="button"
              onClick={() => {
                setSent(true);
                setPhaseIdx(1);
              }}
              className="flex w-full items-center gap-2 rounded-lg bg-[#222529] px-3 py-2.5 text-left text-[13px] text-[#9a9b9e] ring-1 ring-white/10"
            >
              <span className="flex-1 truncate text-[#e8e8e8]">{phase.you}</span>
              <span className="shrink-0 rounded-md bg-[#2bac76] px-2.5 py-1 text-xs font-semibold text-[#0b1f16]">
                {phase.cta}
              </span>
            </button>
          ) : addChoice ? (
            <button
              type="button"
              onClick={() => onChoice(addChoice)}
              className="w-full rounded-lg bg-[#2bac76] py-2.5 text-sm font-semibold text-[#0b1f16] active:scale-[0.98]"
            >
              {addChoice.label}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // actions
  return (
    <div className="flex h-full flex-col bg-[#1a1d21] text-white">
      <div className="px-3 pt-2">
        <ChannelHeader channel={payload.channel} />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        <BotCard
          bot={payload.bot}
          body="Helios MSA — client redline vs playbook"
        />
        {payload.docLink ? (
          <div className="text-[11px] text-[#5b9bd6]">📄 {payload.docLink}</div>
        ) : null}
        <ul className="space-y-2">
          {(payload.flags ?? []).map((f) => (
            <li
              key={f.id}
              className="rounded-lg bg-[#222529] px-3 py-2 text-[12px] ring-1 ring-white/8"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#e8e8e8]">{f.label}</span>
                <VerdictBadge verdict={f.verdict} />
              </div>
              <div className="mt-1 text-[#9a9b9e]">Client: {f.client}</div>
              <div className="text-[#9a9b9e]">Playbook: {f.playbook}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2 border-t border-white/10 p-3">
        <div className="flex gap-2">
          {choices
            ?.filter((c) => c.variant !== "composer")
            .map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChoice(c)}
                className={[
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold active:scale-[0.98]",
                  c.variant === "danger"
                    ? "bg-[#3f1d1d] text-[#fca5a5] ring-1 ring-[#ef4444]/40"
                    : "bg-[#2bac76] text-[#0b1f16]",
                ].join(" ")}
              >
                {c.label}
              </button>
            ))}
        </div>
        {choices
          ?.filter((c) => c.variant === "composer")
          .map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChoice(c)}
              className="flex w-full items-center gap-2 rounded-lg bg-[#222529] px-3 py-2.5 text-left text-[13px] text-[#9a9b9e] ring-1 ring-white/10"
            >
              <span className="flex-1">Message #{payload.channel.replace("#", "")}</span>
              <span className="text-[#2bac76]">{c.label}</span>
            </button>
          ))}
      </div>
    </div>
  );
}

function ChannelHeader({ channel }: { channel: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-[#d1d2d3]">{channel}</div>
      <div className="text-[10px] text-[#9a9b9e]">thread · Helios MSA</div>
    </div>
  );
}

function BotCard({ bot, body }: { bot: string; body: string }) {
  return (
    <div className="rounded-lg bg-[#222529] px-3 py-2 ring-1 ring-white/8">
      <div className="text-xs font-semibold text-[#2bac76]">{bot}</div>
      <p className="mt-1 whitespace-pre-line text-[13px] leading-snug text-[#e8e8e8]">
        {body}
      </p>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const ok = verdict === "ok";
  return (
    <span
      className={[
        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        ok ? "bg-[#14532d]/40 text-[#86efac]" : "bg-[#713f12]/40 text-[#fcd34d]",
      ].join(" ")}
    >
      {ok ? "ok" : "counter"}
    </span>
  );
}
