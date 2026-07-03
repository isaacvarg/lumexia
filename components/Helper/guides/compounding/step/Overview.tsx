import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Working a step is where the batch actually gets made — read the detail, add the
        materials, and record each actionable.
      </GuideTypo.Lead>

      <GuideTypo.Section>On the step</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The instructions, materials, and addendums carried over from the MBPR.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The actionables you must complete before the step can close.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
