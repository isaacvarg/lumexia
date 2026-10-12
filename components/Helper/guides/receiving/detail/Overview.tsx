import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An order&apos;s receiving page is where a delivery is checked in at the dock and
        counted into stock. It&apos;s laid out for a tablet.
      </GuideTypo.Lead>

      <GuideTypo.Section>The sections</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Expected">
          lines still on their way. Tap the ones that arrived, then Receive.
        </GuideTypo.Item>
        <GuideTypo.Item term="Deliveries">
          each delivery received so far: inspection, lots, documents, and anything flagged.
        </GuideTypo.Item>
        <GuideTypo.Item term="Received">
          received lines, where you can reprint labels.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Lines show the <span className="font-semibold">supplier&apos;s</span> name for an
        item when a supplier alias exists (that&apos;s what&apos;s on the physical
        shipment), with your item name underneath.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
