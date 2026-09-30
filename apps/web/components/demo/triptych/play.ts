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
};

async function waitUntil(api: PlayApi, pred: (world: World) => boolean) {
  while (!api.cancelled()) {
    if (pred(api.getWorld())) return true;
    await sleep(40);
  }
  return false;
}

export async function runPlay(api: PlayApi) {
  const { commit, cancelled, typeDraft, typeAgent, typeField } = api;
  if (!(await (async () => {
    await sleep(900);
    return !cancelled();
  })())) return;

  commit((world) => setSpot(world, "mira"));
  commit((world) => setForm(world, "mira", { title: "", description: "", roomId: "product", bookId: "ship" }));
  commit((world) => ({
    ...world,
    columns: { ...world.columns, mira: { ...world.columns.mira, modal: true } },
  }));
  await sleep(280);
  if (cancelled()) return;
  if (!(await typeField("mira", "title", "Annual as default"))) return;
  await sleep(180);
  if (!(await typeField("mira", "description", "Year price leads."))) return;
  await sleep(320);
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
  await sleep(420);
  if (cancelled()) return;

  if (!(await typeDraft("mira", "Annual. Month stays on the second line."))) return;
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

  await sleep(700);
  if (cancelled()) return;
  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-spec",
      kind: "spec",
      title: "Pricing spec",
      detail: "Annual card, month as a second line",
    }),
  );
  commit((world) => goToStep(world, "annual", "Design"));
  await sleep(500);
  if (cancelled()) return;

  commit((world) => releaseAgent(world, "annual"));
  commit((world) => setWait(world, "annual", "lea", "dq"));
  commit((world) => setFilter(world, "lea", "dq"));
  commit((world) => setSpot(world, "lea"));
  await sleep(1100);
  if (cancelled()) return;

  commit((world) => openMission(world, "lea", "annual"));
  commit((world) => openRoom(world, "adam", "product"));
  await sleep(280);
  if (!(await typeAgent("annual", "lea", "Rozvržení je ve tvém slotu.", "dq"))) return;
  await sleep(320);
  if (!(await typeDraft("lea", "Roční karta nahoře. Měsíční nechávám pod ní."))) return;
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

  await sleep(480);
  if (cancelled()) return;
  commit((world) => setSpot(world, "mira"));
  commit((world) => addCheckpoint(world, "annual", "Legal copy"));
  await sleep(700);
  if (cancelled()) return;

  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-diff",
      kind: "diff",
      title: "Pricing diff",
      detail: "Hero price block",
    }),
  );
  await sleep(420);
  commit((world) => goToStep(world, "annual", "Verify"));
  await sleep(360);
  if (cancelled()) return;
  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-check",
      kind: "verification",
      title: "Verification",
      detail: "Checks green",
    }),
  );
  commit((world) => goToStep(world, "annual", "Legal copy"));
  await sleep(420);
  if (cancelled()) return;
  commit((world) =>
    pushArtifact(world, "annual", {
      id: "annual-copy",
      kind: "copy",
      title: "Legal copy",
      detail: "Annual price, tax note",
    }),
  );
  commit((world) => goToStep(world, "annual", "Accept"));
  commit((world) => releaseAgent(world, "annual"));
  commit((world) => openMission(world, "adam", "annual"));
  await sleep(240);
  if (cancelled()) return;
  if (!(await typeDraft("adam", "Округляю до дня."))) return;
  commit((world) => {
    const text = world.columns.adam.draft;
    return {
      ...world,
      missions: world.missions.map((mission) =>
        mission.id === "annual"
          ? {
              ...mission,
              chats: {
                ...mission.chats,
                adam: [...mission.chats.adam, { id: "annual-adam", from: "adam" as const, text }],
              },
            }
          : mission,
      ),
      columns: { ...world.columns, adam: { ...world.columns.adam, draft: "" } },
    };
  });
  await sleep(280);
  if (cancelled()) return;

  commit((world) => assignFreeAgent(world, "annual"));
  if (!(await typeAgent("annual", "mira", "Checks are green. Accept?", "qq"))) return;
  commit((world) => setWait(world, "annual", "mira", "qq"));
  commit((world) => ({
    ...world,
    columns: { ...world.columns, mira: { ...world.columns.mira, pushedId: "annual" } },
  }));
  await sleep(360);
  if (cancelled()) return;
  if (!(await typeDraft("mira", "Accept."))) return;
  commit((world) => closeMission(world, "annual", "done", "mira"));
  commit((world) => setSpot(world, "mira"));
}
