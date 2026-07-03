import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Calendar</span> tab plots open requests
        by when they&apos;re expected to arrive, turning the board into a delivery
        timeline.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it&apos;s for</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Read incoming supply at a glance and spot weeks that are overloaded or bare.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Placement is driven by each request&apos;s expected delivery window — see
          the guide for how that&apos;s set.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
