import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Purchase Order Accounting</span> is the
        money-and-paperwork side of a purchase order — raised in purchasing, received in
        receiving, and squared away here.
      </GuideTypo.Lead>

      <GuideTypo.Section>The dashboard</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          One row per PO: #, Supplier, Payment Method, Total (
          <span className="font-mono">Σ quantity × price</span>), Status, and the
          Paid / Packing Slip / Invoice states.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Filter by Supplier and Payment Method; click a row to open its accounting
          detail.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
