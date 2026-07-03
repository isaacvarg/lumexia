import { GuideTypo } from "../../../typography";

const ItemPricingHistory = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Reachable from an item&apos;s details, this overview shows how the item has been
        priced over time.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it shows</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Trend charts of how the item&apos;s cost, its bill-of-material cost, and its
          finished-product prices have moved across examinations.
        </GuideTypo.Item>
        <GuideTypo.Item>
          A table of the full examination history — clicking any row opens that past
          examination&apos;s detail, so you can review exactly what was decided and why at
          any point.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default ItemPricingHistory;
