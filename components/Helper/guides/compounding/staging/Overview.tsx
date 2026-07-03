import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Staging a material is a short wizard — scan the lot, weigh it, optionally
        photograph it, and review.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why it matters</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Staging is how physical stock is committed to the batch and made ready for
          verification.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
