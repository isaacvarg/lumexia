import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Research Settings → Overhead</span> is a
        single global markup applied on top of every experiment variant&apos;s
        raw BOM cost — there&apos;s one config for the whole app, not one per
        experiment.
      </GuideTypo.Lead>

      <GuideTypo.Section>Fields</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Overhead (% of BOM cost)">
          a percentage markup on the variant&apos;s BOM cost per lb.
        </GuideTypo.Item>
        <GuideTypo.Item term="Overhead ($ per lb)">
          a flat dollar amount added per pound, on top of the percentage.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>The formula</GuideTypo.Section>
      <GuideTypo.Paragraph>
        <span className="font-mono">
          projected $/lb = BOM $/lb × (1 + overhead %) + overhead $/lb
        </span>
      </GuideTypo.Paragraph>

      <GuideTypo.Note>
        This powers the <span className="font-semibold">Cost</span> tab on every
        research experiment — changing it here retroactively changes the
        projected figures shown on every experiment, past and present.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
