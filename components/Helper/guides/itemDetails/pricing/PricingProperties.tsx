import { GuideTypo } from "../../../typography";

const PricingProperties = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Item pricing properties are the adjustments that shape the item&apos;s cost
        — both as an individual good and when it&apos;s used inside another
        item&apos;s bill of materials. The base cost is{" "}
        <span className="font-mono">
          price per unit + arrival cost + unforeseen difficulties
        </span>
        , where price per unit is the upcoming price when active, otherwise the
        last purchase price.
      </GuideTypo.Lead>

      <GuideTypo.Section>Cost adjustments</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Arrival cost">
          what it costs for the item to arrive at the facility (freight, etc.).
        </GuideTypo.Item>
        <GuideTypo.Item term="Production usage cost">
          applied when the item is used in a bill of materials.
        </GuideTypo.Item>
        <GuideTypo.Item term="Unforeseen difficulties cost">
          covers natural disasters, processing difficulties, laborious workup.
        </GuideTypo.Item>
        <GuideTypo.Item term="Auxiliary usage cost">
          applied when the item is an auxiliary in finished-product pricing.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Upcoming price override</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Upcoming price">
          overrides the last purchase price during examinations when the override
          is active.
        </GuideTypo.Item>
        <GuideTypo.Item term="Is upcoming price active">
          enables the override.
        </GuideTypo.Item>
        <GuideTypo.Item term="Upcoming price UOM">
          the unit the upcoming price is expressed in.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default PricingProperties;
