import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The R&amp;D tab connects this MBPR to research — the experiments that use this
        version as a variant.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it shows</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Every experiment whose variant was created as an analog of this MBPR
          version.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
