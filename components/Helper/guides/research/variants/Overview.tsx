import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">variant</span> is one candidate formulation
        inside an experiment — a formulation (what goes in, by concentration) plus a
        method (how it&apos;s made).
      </GuideTypo.Lead>

      <GuideTypo.Section>Why several</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          An experiment usually holds several variants so different formulas can be
          built, sampled, and compared.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
