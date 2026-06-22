import { ComponentType } from "react";

export type Guide = {
  title: string;
  description?: string;
  content: ComponentType;
};

export type GuideSection = {
  id: string;
  title: string;
  guides: Guide[];
};
