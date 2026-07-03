import { GuideSection } from "../../types";
import Overview from "./Overview";
import ExpectedDates from "./ExpectedDates";

export const requestCalendarSection: GuideSection = {
  id: "request-calendar",
  title: "Requests — Calendar",
  overview: Overview,
  guides: [
    {
      title: "Expected On dates",
      description: "The delivery window that drives a request's calendar placement.",
      content: ExpectedDates,
    },
  ],
};
