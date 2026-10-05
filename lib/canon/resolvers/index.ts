import { createHash } from "crypto";
import { CanonSubject } from "../subjectKey";
import { CanonResolver, ResolvedValue } from "./types";
import { activeBomResolver } from "./activeBom";
import { inciAliasesResolver } from "./inciAliases";

// Adding a linked source = write a resolver and register it here.
export const canonResolvers: CanonResolver<any>[] = [
  activeBomResolver,
  inciAliasesResolver,
];

export const getResolver = (key: string): CanonResolver<any> => {
  const resolver = canonResolvers.find((r) => r.key === key);
  if (!resolver) throw new Error(`Unknown canon resolver: ${key}`);
  return resolver;
};

// key-sorted JSON so the marker only changes when the content does
const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

// The marker is a hash of the content itself, so any source edit — whichever screen it came from —
// is detected without the source module having to know about Canon.
export const resolveLinked = async (resolverKey: string, subject: CanonSubject): Promise<ResolvedValue | null> => {
  const content = await getResolver(resolverKey).resolve(subject);
  if (content === null) return null;

  const marker = createHash("sha256").update(stableStringify(content)).digest("hex");
  return { content, marker };
};
