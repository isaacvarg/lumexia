import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Quality tab is the item&apos;s quality program — the standards
        it&apos;s held to and the results recorded against its lots.
      </GuideTypo.Lead>

      <GuideTypo.Section>In this tab</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The item&apos;s quality parameters and specifications.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The examinations recorded against its lots, and the resulting
          measurements.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
