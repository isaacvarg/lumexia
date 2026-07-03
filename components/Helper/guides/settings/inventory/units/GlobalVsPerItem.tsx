import { GuideTypo } from "../../../../typography";

const GlobalVsPerItem = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        This table is <span className="font-semibold">not</span> where
        supplier-specific or item-specific pack-size conversions are set — those
        live elsewhere.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Settings → Inventory → Units defines{" "}
          <span className="font-semibold">global, base</span> conversions — e.g.{" "}
          <span className="font-mono">1 kg = 2.2 lb</span> — that apply
          everywhere the two UOMs are compared.
        </GuideTypo.Item>
        <GuideTypo.Item>
          A separate, per-item mechanism (discrete UOM conversions, configured
          from the item or receiving flow) records{" "}
          <span className="font-mono">
            1 unit of a specific supplier&apos;s UOM = x quantity of the
            inventory UOM
          </span>{" "}
          for one item — e.g. &quot;this supplier&apos;s drum = 55 lb for this
          item,&quot; which doesn&apos;t belong in a global table.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        If a purchasing/receiving conversion looks wrong, check the item&apos;s
        own discrete conversions first — editing the global table here won&apos;t
        touch it.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default GlobalVsPerItem;
