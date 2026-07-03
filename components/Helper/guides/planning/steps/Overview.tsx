import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Steps tab shows each of the batch&apos;s steps and its actionables, with
        completion values that fill in as the batch is compounded.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it&apos;s for</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Track how far the batch has progressed and what operators recorded.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
