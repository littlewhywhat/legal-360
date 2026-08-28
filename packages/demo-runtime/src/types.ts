export type Device = "client" | "supervisor" | "system";
export type AppSkin = "email" | "slack" | "docs" | "system" | "telegram" | "app";

export type Choice = {
  id: string;
  label: string;
  next: string;
  variant?: "primary" | "danger" | "ghost" | "composer";
};

export type Scene = {
  id: string;
  step: number;
  totalSteps: number;
  device: Device;
  app: AppSkin;
  title: string;
  hint: string;
  next?: string;
  choices?: Choice[];
  payload: Record<string, unknown>;
};

export type CaseMeta = {
  id: string;
  title: string;
  tagline: string;
};

export type DemoCase = {
  meta: CaseMeta;
  scenes: Scene[];
  sceneById: Record<string, Scene>;
  firstSceneId: string;
};
