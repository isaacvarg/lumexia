import { GuideTypo } from "../../../typography";

const Statuses = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Every experiment carries a status describing where the study stands. New ones
        start at <span className="font-semibold">Planning</span>.
      </GuideTypo.Lead>

      <GuideTypo.Section>The statuses</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Planning">
          being set up; scope, variants, and samples still being defined.
        </GuideTypo.Item>
        <GuideTypo.Item term="Active">underway; samples being made and measured.</GuideTypo.Item>
        <GuideTypo.Item term="On Hold">paused; expected to resume later.</GuideTypo.Item>
        <GuideTypo.Item term="Completed">the study reached its conclusion.</GuideTypo.Item>
        <GuideTypo.Item term="Cancelled">stopped without completing.</GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Status is set by hand on the <span className="font-semibold">Basics</span> tab
        and is <span className="font-semibold">descriptive, not a gate</span> — unlike
        a production batch, an experiment doesn&apos;t lock work behind its status.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Statuses;
