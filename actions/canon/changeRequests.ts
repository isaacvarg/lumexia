"use server";

import { getUserId } from "@/actions/users/getUserId";
import {
  CanonSourceInput,
  confirmStale,
  proposeEdit,
  proposeSourceAcceptance,
  reviewChangeRequest,
  withdrawChangeRequest,
} from "@/lib/canon/changeRequests";
import { CanonSubject } from "@/lib/canon/subjectKey";

export const proposeCanonEdit = async (input: {
  dataTypeId: string;
  subject: CanonSubject;
  proposedContent: unknown;
  reason: string;
  sources?: CanonSourceInput[];
}) => {
  return proposeEdit(await getUserId(), input);
};

export const confirmCanonStale = async (input: { artifactId: string; reason: string }) => {
  return confirmStale(await getUserId(), input);
};

export const acceptCanonSource = async (input: { dataTypeId: string; subject: CanonSubject; reason: string }) => {
  return proposeSourceAcceptance(await getUserId(), input);
};

export const reviewCanonChangeRequest = async (input: {
  changeRequestId: string;
  approved: boolean;
  comment?: string | null;
}) => {
  return reviewChangeRequest(await getUserId(), input);
};

export const withdrawCanonChangeRequest = async (changeRequestId: string) => {
  return withdrawChangeRequest(await getUserId(), changeRequestId);
};
