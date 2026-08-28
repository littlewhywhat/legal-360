import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 5;

const TABS = {
  home: "s4-home",
  hot: "s2-hot",
  goals: "s5-goals",
} as const;

const holdings = [
  { ticker: "ADBE", name: "Adobe", value: "$4,200", change: "+2.1%", then: "$6,100" },
  { ticker: "BTC", name: "Bitcoin", value: "$8,400", change: "−1.4%", then: "$12,000" },
  { ticker: "SPY", name: "S&P 500", value: "$3,400", change: "+0.6%", then: "$4,800" },
];

const candidate = {
  ticker: "BYRN",
  name: "Byrna Technologies",
  value: "$1,200",
  change: "+4.0%",
  then: "$2,400",
};

const signals = [
  {
    ticker: "BYRN",
    name: "Byrna Technologies",
    blurb: "Insider bought yesterday",
    ping: true,
  },
  {
    ticker: "DE",
    name: "Deere",
    blurb: "Insider bought this week",
    ping: false,
  },
];

const status = {
  pnl: "+$1,000",
  equity: "$16,000",
};

export const scenes: Scene[] = [
  {
    id: "s1-tg-ping",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "telegram",
    title: "Opportunity ping",
    hint: "Tap the DM — opens Hot, not the portfolio",
    next: "s2-hot",
    payload: {
      mode: "notification",
      bot: "Investing OS",
      time: "7:14 AM",
      text: "Insider bought BYRN — cheap vs own 5y.",
    },
  },
  {
    id: "s2-hot",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "app",
    title: "Hot",
    hint: "Same research as the ping — tap BYRN for the dossier",
    payload: {
      mode: "hot",
      tabs: TABS,
      activeTab: "hot",
      dossierScene: "s3-dossier",
      signals,
      status,
      holdings,
      candidate,
    },
  },
  {
    id: "s3-dossier",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "app",
    title: "Dossier",
    hint: "Cards, not a quiz — Add puts BYRN on Home",
    payload: {
      mode: "dossier",
      tabs: TABS,
      activeTab: "hot",
      ticker: "BYRN",
      name: "Byrna Technologies",
      print: {
        who: "CEO, direct",
        code: "P",
        size: "$210k",
        when: "yesterday",
      },
      memo: [
        "Cash from ops still thin; inventory up with sell-in.",
        "No leverage spike. Option on execution, not a compounder.",
      ],
      buyers: [
        { label: "Other insiders", detail: "CFO small P same week" },
        { label: "eToro", detail: "2 copy traders opened this week" },
        { label: "13F", detail: "No Buffett / Burry last quarter" },
      ],
      ceo: {
        name: "Bryan Ganz",
        blurb: "Less-lethal defense for civilians and agencies.",
      },
      signals,
      status,
      holdings,
      candidate,
    },
  },
  {
    id: "s4-home",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "app",
    title: "Home",
    hint: "Portfolio — BYRN appears after Add. Tab to Goals",
    payload: {
      mode: "home",
      tabs: TABS,
      activeTab: "home",
      dossierScene: "s3-dossier",
      status,
      holdings,
      candidate,
      signals,
    },
  },
  {
    id: "s5-goals",
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "app",
    title: "Goals",
    hint: "2030 book at assumed prices — BYRN only if you added it",
    payload: {
      mode: "goals",
      tabs: TABS,
      activeTab: "goals",
      horizon: "2030",
      totalNow: "$16,000",
      totalThen: "$22,900",
      totalThenWithCandidate: "$25,300",
      status,
      holdings,
      candidate,
      signals,
    },
  },
];
