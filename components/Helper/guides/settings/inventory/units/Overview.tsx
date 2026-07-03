import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Inventory Settings → Units</span> holds
        the catalog of Units of Measurement and a table of global conversion
        rates between them.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item term="Units of Measurement">
          a CRUD table of Name + Abbreviation (e.g. Pound / lb).
        </GuideTypo.Item>
        <GuideTypo.Item term="UOM Conversions">
          a CRUD table of{" "}
          <span className="font-mono">1 UOM A = factor × UOM B</span> rates, with
          a live preview as you edit.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
