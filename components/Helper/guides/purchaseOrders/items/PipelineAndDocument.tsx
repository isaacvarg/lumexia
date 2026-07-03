import { GuideTypo } from "../../../typography";

const PipelineAndDocument = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The header&apos;s <span className="font-semibold">Next</span> /{" "}
        <span className="font-semibold">Previous</span> buttons move the order through
        its pipeline, and the <span className="font-semibold">PO</span> button turns
        it into a document.
      </GuideTypo.Lead>

      <GuideTypo.Section>Pipeline stages</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Draft">
          being built, not yet sent.
        </GuideTypo.Item>
        <GuideTypo.Item term="Pending">
          sent, awaiting the supplier&apos;s response.
        </GuideTypo.Item>
        <GuideTypo.Item term="Confirmed / Awaiting Delivery">
          supplier confirmed, goods on the way.
        </GuideTypo.Item>
        <GuideTypo.Item term="Received / Partially Received">
          set automatically by receiving, not by hand.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Manual advancement only goes as far as{" "}
        <span className="font-semibold">Confirmed / Awaiting Delivery</span>; each
        change applies to the order and all its line items. Receiving can only see an
        order once it reaches that stage — the{" "}
        <span className="font-semibold">Receiving</span> button warns you otherwise —
        and it sets the last two stages when the shipment is booked in.
      </GuideTypo.Note>

      <GuideTypo.Section>The PO document</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The <span className="font-semibold">PO</span> button generates a PDF with
          your company details and logo, shipping and supplier addresses, the line
          items, the public and supplier notes, and totals.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Company details and logo come from{" "}
          <span className="font-semibold">Settings → Company</span> (
          <span className="font-mono">/settings/company</span>); the supplier&apos;s
          address prints only if its{" "}
          <span className="font-semibold">Show address on purchase order</span> toggle
          is on.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default PipelineAndDocument;
