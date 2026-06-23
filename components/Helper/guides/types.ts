import { ComponentType } from "react";

export type Guide = {
  title: string;
  description?: string;
  content: ComponentType;
};

export type GuideSection = {
  id: string;
  title: string;
  // Starting view shown below the tiles when no guide is selected.
  overview?: ComponentType;
  guides: Guide[];
};
