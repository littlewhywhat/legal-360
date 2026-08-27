import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 4;

export const scenes: Scene[] = [
  {
    id: "s1-tg-ping",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "telegram",
    title: "Opportunity ping",
    hint: "Tap the DM to open the app",
    next: "s2-home",
    payload: {
      mode: "notification",
      bot: "Investing OS",
      time: "7:14 AM",
      text: "Insider P on BYRN (risk sleeve) — cheap vs own 5y. Open dossier.",
    },
  },
  {
    id: "s2-home",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "app",
    title: "Home",
    hint: "Status and goal are here — tap BYRN to research",
    next: "s3-dossier",
    payload: {
      mode: "home",
      status: {
        equity: "$16,000",
        deposits: "$20,000",
        cashouts: "$5,000",
        pnl: "+$1,000",
        formula: "16 + 5 − 20",
      },
      goal: {
        coverage: "67%",
        coveragePct: 67,
        hitDate: "Mar 2028",
        label: "Expense coverage",
      },
      opportunity: {
        ticker: "BYRN",
        sleeve: "Risk",
        headline: "Open-market P · cheap vs 5y",
        sub: "Form 4 this morning",
      },
      defense: {
        ticker: "ADBE",
        text: "Holding · no new negative tape",
      },
    },
  },
  {
    id: "s3-dossier",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "app",
    title: "Dossier",
    hint: "Scroll the one-run research, then continue",
    next: "s4-verdict",
    payload: {
      mode: "dossier",
      ticker: "BYRN",
      name: "Byrna Technologies",
      sleeve: "Risk sleeve · vs ADBE core",
      print: {
        who: "CEO, direct",
        code: "P",
        size: "$210k open-market",
        when: "yesterday",
      },
      memo: [
        "Cash from ops still thin; inventory up with sell-in.",
        "No leverage spike. Not a quality compounder — option on execution.",
      ],
      buyers: [
        { label: "Other insiders", detail: "CFO small P same week" },
        { label: "eToro", detail: "2 copy traders opened this week" },
        { label: "13F", detail: "No Buffett / Burry print last quarter" },
      ],
    },
  },
  {
    id: "s4-verdict",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "app",
    title: "Verdict",
    hint: "Like / Skip is yours — hypothesis is a card, not an order",
    choices: [
      { id: "like", label: "Like", next: "s1-tg-ping", variant: "primary" },
      { id: "skip", label: "Skip", next: "s1-tg-ping", variant: "ghost" },
    ],
    payload: {
      mode: "verdict",
      ticker: "BYRN",
      ceo: "Bryan Ganz",
      mission: "Less-lethal defense for civilians and agencies. Do you like the people and the mission?",
      hypothesis: {
        r: "6.9%",
        g: "12%",
        spread: "+5.1 pp",
        months: "~18 mo to repay at g",
        leftover: "Ahead vs paying cash — if g holds",
        caveat: "If g ≤ r or the name drops, the loan still exists.",
      },
    },
  },
];
