import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Notes tab holds notes attached to this MBPR as a whole.
      </GuideTypo.Lead>

      <GuideTypo.Section>Scope</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Record-level context about the recipe — kept apart from the per-step detail
          in the wizard.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
