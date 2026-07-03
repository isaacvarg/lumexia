import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Conducting an examination is a guided flow — pick the lot, choose a type,
        record the results, and set a verdict.
      </GuideTypo.Lead>

      <GuideTypo.Section>The flow</GuideTypo.Section>
      <GuideTypo.Paragraph>
        <span className="font-mono">Lot → Type → Examination → Verdict</span>. The
        guides here walk the steps and explain the live verdicts.
      </GuideTypo.Paragraph>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
