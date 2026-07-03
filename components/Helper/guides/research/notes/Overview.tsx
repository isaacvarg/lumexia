import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Notes tab is an <span className="font-semibold">aggregated feed</span> of
        every note across the experiment and its samples.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why it helps</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          A running log of the whole study without hunting through individual samples.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
