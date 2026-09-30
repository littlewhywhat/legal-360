import {
  addCheckpoint,
  assignFreeAgent,
  closeMission,
  createMission,
  goToStep,
  markTodo,
  openMission,
  openRoom,
  pushArtifact,
  releaseAgent,
  setAdding,
  setChatTab,
  setCheckpoint,
  setFilter,
  setForm,
  setSpot,
  setWait,
  type PersonId,
  type World,
} from "./model";

export function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type PlayApi = {
  getWorld: () => World;
  commit: (recipe: (world: World) => World) => void;
  cancelled: () => boolean;
  typeDraft: (person: PersonId, text: string) => Promise<boolean>;
  typeAgent: (missionId: string, person: PersonId, text: string, tag?: "qq" | "dq") => Promise<boolean>;
  typeField: (person: PersonId, field: "title" | "description", text: string) => Promise<boolean>;
  typeCheckpoint: (person: PersonId, text: string) => Promise<boolean>;
};

async function waitUntil(api: PlayApi, pred: (world: World) => boolean) {
  while (!api.cancelled()) {
    if (pred(api.getWorld())) return true;
    await sleep(50);
  }
  return false;
}

function bothTabs(world: World, tab: PersonId): World {
  return setChatTab(setChatTab(world, "mira", tab), "lea", tab);
}

export async function runPlay(api: PlayApi) {
  const { commit, cancelled, typeDraft, typeAgent, typeField, typeCheckpoint } = api;
  await sleep(2000);
  if (cancelled()) return;

  commit((world) => setSpot(world, "mira"));
  await sleep(500);
  if (cancelled()) return;
  commit((world) => setForm(world, "mira", { title: "", description: "", roomId: "product", bookId: "ship" }));
  commit((world) => ({
    ...world,
    columns: { ...world.columns, mira: { ...world.columns.mira, modal: true } },
  }));
  await sleep(700);
  if (cancelled()) return;
  if (!(await typeField("mira", "title", "Annual as default"))) return;
  await sleep(500);
  if (!(await typeField("mira", "description", "Year price leads."))) return;
  await sleep(800);
  if (cancelled()) return;

  commit((world) =>
    createMission(world, "mira", {
      id: "annual",
      title: "Annual as default",
      description: "Year price leads.",
      roomId: "product",
      bookId: "ship",
      opening: "Default price — month or year?",
    }),
  );

  const booted = await waitUntil(api, (world) => {
    const mission = world.missions.find((item) => item.id === "annual");
    return Boolean(mission && mission.boot === null && mission.waits.mira === "qq");
  });
  if (!booted) return;
  await sleep(1400);
  if (cancelled()) return;

  if (!(await typeDraft("mira", "Annual. Month stays on the second line."))) return;
  await sleep(400);
  if (cancelled()) return;
  commit((world) => {
    const text = world.columns.mira.draft;
    let next = {
      ...world,
      missions: world.missions.map((mission) => {
        if (mission.id !== "annual") return mission;
        const waits = { ...mission.waits };
        delete waits.mira;
        return {
          ...mission,
          waits,
          chats: {
            ...mission.chats,
            mira: [...mission.chats.mira, { id: "annual-answer", from: "mira" as const, text }],
          },
        };
      }),
      columns: { ...world.columns, mira: { ...world.columns.mira, draft: "" } },
    };
    next = pushArtifact(next, "annual", {
      id: "annual-decision",
      kind: "decision",
      title: "Annual default",
      detail: "Year price first",
    });
    next = markTodo(next, "annual", "Write the decision");
    next = goToStep(next, "annual", "Spec");
    return next;
  });

  await sleep(1800);
  if (cancelled()) return;
  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-spec",
      kind: "spec",
      title: "Pricing spec",
      detail: "Annual card, month as a second line",
    }),
  );
  await sleep(900);
  commit((world) => goToStep(world, "annual", "Design"));
  await sleep(1400);
  if (cancelled()) return;

  commit((world) => releaseAgent(world, "annual"));
  commit((world) => setWait(world, "annual", "lea", "dq"));
  commit((world) => setFilter(world, "lea", "dq"));
  commit((world) => setSpot(world, "lea"));
  await sleep(2600);
  if (cancelled()) return;

  commit((world) => openRoom(world, "lea", "product"));
  await sleep(2800);
  if (cancelled()) return;

  commit((world) => openMission(world, "lea", "annual"));
  commit((world) => bothTabs(world, "lea"));
  await sleep(600);
  if (!(await typeAgent("annual", "lea", "Rozvržení je ve tvém slotu.", "dq"))) return;
  await sleep(800);
  if (cancelled()) return;
  if (!(await typeDraft("lea", "Roční karta nahoře. Měsíční nechávám pod ní."))) return;
  await sleep(400);
  if (cancelled()) return;
  commit((world) => {
    const text = world.columns.lea.draft;
    let next = {
      ...world,
      missions: world.missions.map((mission) => {
        if (mission.id !== "annual") return mission;
        const waits = { ...mission.waits };
        delete waits.lea;
        return {
          ...mission,
          waits,
          chats: {
            ...mission.chats,
            lea: [...mission.chats.lea, { id: "annual-lea", from: "lea" as const, text }],
          },
        };
      }),
      columns: { ...world.columns, lea: { ...world.columns.lea, draft: "" } },
    };
    next = pushArtifact(next, "annual", {
      id: "annual-design",
      kind: "design",
      title: "Pricing layout",
      detail: "Annual card on top",
    });
    next = goToStep(next, "annual", "Implement");
    next = assignFreeAgent(next, "annual");
    return next;
  });

  await sleep(1600);
  if (cancelled()) return;
  commit((world) => setSpot(world, "mira"));
  commit((world) => setAdding(world, "mira", true));
  await sleep(700);
  if (!(await typeCheckpoint("mira", "Legal copy"))) return;
  await sleep(500);
  if (cancelled()) return;
  commit((world) => addCheckpoint(world, "annual", "Legal copy"));
  commit((world) => setAdding(world, "mira", false));
  await sleep(1800);
  if (cancelled()) return;

  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-diff",
      kind: "diff",
      title: "Pricing diff",
      detail: "Hero price block",
    }),
  );
  await sleep(900);
  commit((world) => goToStep(world, "annual", "Verify"));
  await sleep(800);
  if (cancelled()) return;
  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-check",
      kind: "verification",
      title: "Verification",
      detail: "Checks green",
    }),
  );
  await sleep(800);
  commit((world) => goToStep(world, "annual", "Legal copy"));
  await sleep(900);
  if (cancelled()) return;
  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-copy",
      kind: "copy",
      title: "Legal copy",
      detail: "Annual price, tax note",
    }),
  );
  await sleep(800);
  commit((world) => goToStep(world, "annual", "Accept"));
  commit((world) => releaseAgent(world, "annual"));
  await sleep(700);
  if (cancelled()) return;

  commit((world) => assignFreeAgent(world, "annual"));
  commit((world) => bothTabs(world, "mira"));
  if (!(await typeAgent("annual", "mira", "Checks are green. Accept?", "qq"))) return;
  commit((world) => setWait(world, "annual", "mira", "qq"));
  commit((world) => ({
    ...world,
    columns: { ...world.columns, mira: { ...world.columns.mira, pushedId: "annual" } },
  }));
  await sleep(800);
  if (cancelled()) return;
  if (!(await typeDraft("mira", "Accept."))) return;
  await sleep(350);
  commit((world) => closeMission(world, "annual", "done", "mira"));
  commit((world) => setSpot(world, "mira"));
}
