import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Activity tab is the batch&apos;s change log.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it&apos;s for</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>See what changed on the batch and when.</GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
