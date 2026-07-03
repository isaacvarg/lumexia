import { GuideTypo } from "../../../typography";

const LineItems = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Line items are the heart of the order. The tab is read-only until you enter
        modify mode, and it&apos;s built for fast keyboard entry.
      </GuideTypo.Lead>

      <GuideTypo.Section>Adding & editing</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          <span className="font-mono">ctrl + e</span> toggles view / modify mode;{" "}
          <span className="font-mono">ctrl + r</span> opens the add-item row;{" "}
          <span className="font-mono">enter</span> adds the top search result.
        </GuideTypo.Item>
        <GuideTypo.Item>
          You can search an item by name, alias, or reference code. A new line starts
          at <span className="font-mono">quantity 0</span>,{" "}
          <span className="font-mono">price 0</span>, using the item&apos;s inventory
          unit.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Each line</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Quantity">how much to order.</GuideTypo.Item>
        <GuideTypo.Item term="Price Per Unit">
          the agreed price per unit of measurement.
        </GuideTypo.Item>
        <GuideTypo.Item term="UOM">
          the unit the supplier sells in — any unit in the system.
        </GuideTypo.Item>
        <GuideTypo.Item term="Total">
          <span className="font-mono">Quantity × Price Per Unit</span>, calculated for
          you.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The PO does <span className="font-semibold">no</span> unit conversion — it
        stores exactly what you ordered in the purchase UOM. Conversion to the
        item&apos;s inventory unit happens at{" "}
        <span className="font-semibold">receiving</span>, via a standard or
        supplier-specific <span className="font-semibold">discrete conversion</span>.
        If a supplier sells in a non-standard pack and no discrete conversion exists
        for that item + supplier, receiving can&apos;t convert it.
      </GuideTypo.Note>

      <GuideTypo.Section>Supplier aliases</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          When a supplier alias exists for the order&apos;s supplier and item, the
          line shows the <span className="font-semibold">supplier&apos;s</span> name
          for the item, with a tooltip listing every alias plus your true name.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The generated PO prints the alias, so the document reads in the
          supplier&apos;s terms.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default LineItems;
