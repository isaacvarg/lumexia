export type Guide = {
  title: string;
};

export type GuideSection = {
  id: string; // unique key referenced by setters, e.g. "items"
  title: string; // text shown in the helper bar, e.g. "Learn how items work"
  guides: Guide[]; // guides belonging to this section
};
