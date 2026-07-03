import { GuideTypo } from "../../../typography";

const UnitsAndConversions = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An order records quantities in the unit the supplier sells in, which
        isn&apos;t always how you stock the item. Receiving reconciles the two before
        it creates the lot.
      </GuideTypo.Lead>

      <GuideTypo.Section>How it converts</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          When the purchase unit differs from the item&apos;s{" "}
          <span className="font-semibold">inventory UOM</span>, the received quantity
          is converted into the inventory unit first.
        </GuideTypo.Item>
        <GuideTypo.Item term="Standard conversion">
          for SI or imperial units.
        </GuideTypo.Item>
        <GuideTypo.Item term="Discrete conversion">
          supplier-specific, for pack units like a case, tote, or drum.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        If no conversion exists for the units involved, the line{" "}
        <span className="font-semibold">can&apos;t</span> be received and shows a red{" "}
        <span className="font-semibold">Conversion Error</span> button. Clicking it
        opens the discrete-conversion form for that item and supplier, prefilled with
        the purchase unit (e.g. <span className="font-mono">1 drum = 450 lb</span>);
        save it, return, and the line receives normally.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default UnitsAndConversions;
