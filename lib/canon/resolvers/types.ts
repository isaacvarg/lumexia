import { CanonContent, CanonShapeKey } from "../shapes";
import { CanonSubject } from "../subjectKey";

// A resolver reads a linked data type's value live from Lumexia.
// CanonDataType.resolverKey stores `key`; settings list resolvers by `label`.
export type CanonResolver<K extends CanonShapeKey = CanonShapeKey> = {
  key: string;
  label: string;
  description: string;
  shapeKey: K;
  subjectKind: CanonSubject["kind"];
  // null when the subject has no source yet (e.g. no active MBPR)
  resolve: (subject: CanonSubject) => Promise<CanonContent<K> | null>;
};

export type ResolvedValue = {
  content: unknown;
  // compared with the accepted version's sourceMarker to detect unreviewed changes
  marker: string;
};
