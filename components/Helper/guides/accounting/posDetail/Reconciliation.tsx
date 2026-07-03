import { GuideTypo } from "../../../typography";

const Reconciliation = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Details</span> tab is the reconciliation
        checklist — the yes/no states plus the status and payment method.
      </GuideTypo.Lead>

      <GuideTypo.Section>The panels</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Toggles">
          <span className="font-semibold">Paid</span>,{" "}
          <span className="font-semibold">Packing Slip</span> (Received/Missing), and{" "}
          <span className="font-semibold">Invoice</span> (Handed Off/Not Yet) — flipping
          one records the change immediately.
        </GuideTypo.Item>
        <GuideTypo.Item term="Purchase order info">
          read-only reference code (links back to purchasing), created date, supplier,
          purchasing status, and total.
        </GuideTypo.Item>
        <GuideTypo.Item term="Accounting Status">
          a large colored block — click to pick a new status.
        </GuideTypo.Item>
        <GuideTypo.Item term="Payment Method">
          click to choose one from the catalog.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Matching is a <span className="font-semibold">human checklist</span> backed by
        attached documents — Lumexia does <span className="font-semibold">not</span>{" "}
        automatically compare an invoice total against the PO total. The value is the
        shared, auditable record.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Reconciliation;
