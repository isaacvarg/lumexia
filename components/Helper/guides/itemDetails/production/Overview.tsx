import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Production tab shows how the item relates to manufacturing. What it
        displays depends on the item&apos;s procurement type.
      </GuideTypo.Lead>

      <GuideTypo.Section>Two views</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Produced items">
          the active master batch record and its bill of materials, plus the
          batches produced.
        </GuideTypo.Item>
        <GuideTypo.Item term="Purchased items">
          how the item is consumed and used across production.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
