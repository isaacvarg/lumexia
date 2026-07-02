import { GuideTypo } from "../../typography";

const ProcurementTypes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An item&apos;s <span className="font-semibold">procurement type</span> is
        more than a label — it decides how the item is sourced, how it&apos;s
        priced, and which tabs appear on its details page.
      </GuideTypo.Lead>

      <GuideTypo.Section>The two types</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Purchased">
          sourced from a supplier and received into inventory. Shows a Purchasing
          tab, and its cost is derived from its most recent purchase price.
        </GuideTypo.Item>
        <GuideTypo.Item term="Produced">
          manufactured in-house via a batch record. Has no Purchasing tab; its
          cost is rolled up from the active master batch record&apos;s bill of
          materials.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Don&apos;t confuse this with the{" "}
        <span className="font-semibold">item type</span>, which is the item&apos;s
        category (raw material, packaging, finished good, …). Procurement type
        controls sourcing and pricing; item type is a classification.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ProcurementTypes;
