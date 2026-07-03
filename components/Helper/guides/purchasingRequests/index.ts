import { GuideSection } from "../types";
import { requestNewSection } from "./new";
import { requestStatusSection } from "./status";
import { requestSupplierSection } from "./supplier";
import { requestCalendarSection } from "./calendar";
import { requestDetailsSection } from "./details";

// The purchasing requests board (one section per view tab, keyed `request-<tab>`
// and driven by RequestHelper.tsx) plus the request detail page (`request-details`,
// set declaratively with HelperSetter).
export const purchasingRequestSections: GuideSection[] = [
  requestNewSection,
  requestStatusSection,
  requestSupplierSection,
  requestCalendarSection,
  requestDetailsSection,
];
