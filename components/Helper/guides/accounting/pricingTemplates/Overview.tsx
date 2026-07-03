import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">pricing template</span> is a reusable blueprint
        of finished products, so you don&apos;t rebuild the same container set for every
        examination.
      </GuideTypo.Lead>

      <GuideTypo.Section>Where they live</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Managed at <span className="font-mono">/accounting/pricing/templates</span>{" "}
          through a wizard, reachable from <span className="font-semibold">Configure
          Templates</span> on the pricing landing page.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
