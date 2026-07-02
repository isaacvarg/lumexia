import { GuideTypo } from "../../../typography";

const PurchaseOrders = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The purchase orders table lists every PO for the item. Filter it by{" "}
        <span className="font-semibold">supplier</span> and{" "}
        <span className="font-semibold">purchase order status</span> to narrow it
        down.
      </GuideTypo.Lead>

      <GuideTypo.Section>Columns</GuideTypo.Section>
      <GuideTypo.Paragraph>
        Each row shows figures scoped to{" "}
        <span className="font-semibold">this item&apos;s line</span> on the order,
        not the whole PO:
      </GuideTypo.Paragraph>
      <GuideTypo.List>
        <GuideTypo.Item>Supplier and status</GuideTypo.Item>
        <GuideTypo.Item>Quantity ordered</GuideTypo.Item>
        <GuideTypo.Item>Total dollar amount for the line item</GuideTypo.Item>
        <GuideTypo.Item>Price in $/UOM for the item</GuideTypo.Item>
        <GuideTypo.Item>Updated timestamp</GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A PO records quantity in the supplier&apos;s purchase unit; the conversion
        to your inventory UOM happens at receiving via a standard or discrete
        conversion — a missing conversion blocks receiving.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default PurchaseOrders;
