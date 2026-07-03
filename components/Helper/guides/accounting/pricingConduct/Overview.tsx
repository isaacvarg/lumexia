import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The conduct screen is where you work an examination — set each finished
        product&apos;s price until it clears the margin target.
      </GuideTypo.Lead>

      <GuideTypo.Section>The tabs</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Finished Products">
          each container&apos;s cost and the price you&apos;re setting.
        </GuideTypo.Item>
        <GuideTypo.Item term="Competition">
          comparison against competitor pricing.
        </GuideTypo.Item>
        <GuideTypo.Item term="BOM">
          the bill of materials behind a produced item&apos;s cost (produced items only).
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
