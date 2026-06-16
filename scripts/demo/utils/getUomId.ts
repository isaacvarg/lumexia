import { refs } from "../lib/refs";

export const getUomId = (key: string): string => (refs.uom as Record<string, string>)[key];
