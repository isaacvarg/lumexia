import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Activity</span> tab is the order&apos;s
        audit trail — a log of every change made to it and its line items.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it&apos;s for</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Answer who changed what and when — status moves, item edits, and more.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
