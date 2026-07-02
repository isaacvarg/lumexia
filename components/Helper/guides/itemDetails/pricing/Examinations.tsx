import { GuideTypo } from "../../../typography";

const Examinations = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A pricing examination audits what the item costs and recomputes the
        consumer price of each of its finished products to clear a target profit
        margin, then archives a full snapshot.
      </GuideTypo.Lead>

      <GuideTypo.Section>How it works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The target margin is <span className="font-mono">15%</span> — a finished
          product reads green above it and red below.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Sourcing drives the math: purchased items price from their purchase
          price; produced items price from the active MBPR&apos;s bill of
          materials.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Receiving an item can auto-trigger an examination, if the item type has
          that trigger enabled.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>On this tab</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Last Examination">
          surfaces the most recent examination&apos;s finished-product retail and
          total.
        </GuideTypo.Item>
        <GuideTypo.Item term="Examinations table">
          filterable by Conducted by; rows open the examination&apos;s details.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Start a new one with{" "}
          <span className="font-semibold">New Examination</span>.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Examinations;
