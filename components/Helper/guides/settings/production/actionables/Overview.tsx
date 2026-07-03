import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">
          Production Settings → Step Actionable Types
        </span>{" "}
        defines the data-capture widgets that appear on production steps —
        checkboxes, number entries, photo uploads, or free text.
      </GuideTypo.Lead>

      <GuideTypo.Section>Fields</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Name / Description">
          what shows on the step.
        </GuideTypo.Item>
        <GuideTypo.Item term="Data Type">
          boolean, numeric, photo, or text — determines the conditional config
          below and the widget rendered.
        </GuideTypo.Item>
        <GuideTypo.Item term="User Role">
          which role is responsible for completing this actionable.
        </GuideTypo.Item>
        <GuideTypo.Item term="Colors">
          background/text color for the badge shown on the step.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        This is a shared definitions table, not scoped to one MBPR or step —
        the same Actionable Type can be reused across many BPRs.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
