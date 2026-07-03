import { GuideTypo } from "../../../typography";

const PricingToMargin = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        For each finished product you set a price, and the point is to leave enough
        margin. The <span className="font-semibold">Alter By</span> control lets you drive
        from whichever figure you think in.
      </GuideTypo.Lead>

      <GuideTypo.Section>The four figures</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Consumer Price">
          <span className="font-mono">cost × (1 + markup/100)</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Markup %">
          <span className="font-mono">(consumer − cost) / cost × 100</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Profit">
          <span className="font-mono">consumer − cost</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Profit Margin">
          <span className="font-mono">(consumer − cost) / consumer × 100</span>.
        </GuideTypo.Item>
      </GuideTypo.List>
      <GuideTypo.Paragraph>
        Enter one and the other three are back-solved automatically. Products color{" "}
        <span className="font-semibold">red</span> while they fall short and{" "}
        <span className="font-semibold">green</span> once they pass.
      </GuideTypo.Paragraph>

      <GuideTypo.Note>
        The target profit margin is currently <span className="font-semibold">hardcoded
        at 15%</span> — a finished product is flagged valid only when its margin exceeds
        15%. <span className="font-semibold">Apply Template</span> instantiates a
        template&apos;s containers pre-filled with cost, but with pricing figures left at
        zero for you to dial in.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default PricingToMargin;
