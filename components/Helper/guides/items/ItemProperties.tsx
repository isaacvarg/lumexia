import { GuideTypo } from "../../typography";

const ItemProperties = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Every item carries a small set of core properties. Together they identify
        the item and control how it behaves across inventory, purchasing, and
        production.
      </GuideTypo.Lead>

      <GuideTypo.Section>The properties</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Name">the item&apos;s display name.</GuideTypo.Item>
        <GuideTypo.Item term="Reference code">
          a unique code identifying the item across reports and external systems.
          No two items can share one, and it forms the start of every lot number.
        </GuideTypo.Item>
        <GuideTypo.Item term="Item type">
          the category (raw material, packaging, finished good, …). Item types
          carry their own configuration, such as whether receiving the item
          triggers a pricing examination.
        </GuideTypo.Item>
        <GuideTypo.Item term="Procurement type">
          whether the item is purchased from a supplier or produced in-house. This
          changes the tabs and behavior shown on the item.
        </GuideTypo.Item>
        <GuideTypo.Item term="Inventory type">
          whether the item&apos;s quantity is tracked. Tracked items take part in
          stock counts and audits.
        </GuideTypo.Item>
        <GuideTypo.Item term="Inventory UOM">
          the single unit every lot and transaction for the item is converted to
          and counted in (kg, lb, unit, …).
        </GuideTypo.Item>
        <GuideTypo.Item term="Record status">
          active, inactive, or archived. Archived items are hidden from normal
          views and excluded from stock calculations, but their history is
          preserved.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The inventory UOM is the unit you naturally think of the item in. Because
        every recorded quantity is expressed in it, changing it is a deliberate
        Danger-zone action — and doing so also clears the item&apos;s discrete
        conversions.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ItemProperties;
