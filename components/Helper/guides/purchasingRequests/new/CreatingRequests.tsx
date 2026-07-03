import { GuideTypo } from "../../../typography";

const CreatingRequests = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        There are two kinds of request. A{" "}
        <span className="font-semibold">standard</span> request is for an item
        already in Lumexia; a <span className="font-semibold">general</span> request
        is a placeholder for something that isn&apos;t in the system yet.
      </GuideTypo.Lead>

      <GuideTypo.Section>Standard request — the wizard</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>
          <span className="font-semibold">Select Item</span> — search or scan.
          Scanning a lot barcode autofills only the parent item, never a quantity.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Existing Requests Validation</span> — a
          duplicate check; if active requests already exist you&apos;re warned, and
          continuing is recorded on the snapshot.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Notes</span> — optional context for
          purchasing.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Complete</span> — saved at status{" "}
          <span className="font-mono">Requested</span> with normal priority, and an
          inventory snapshot is captured.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Section>General request</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Started via <span className="font-semibold">Can&apos;t Find An Item?</span>{" "}
          when the thing to buy isn&apos;t in Lumexia — it&apos;s a placeholder until
          purchasing sources it.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Once sourced, the <span className="font-semibold">Add Item &amp; Request</span>{" "}
          form (Name, Reference Code, Item Type) creates the real item — defaulting
          to tracked, purchased, counted in pounds, active — plus a linked standard
          request.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        You can also start a request pre-filled from an item: its detail title row
        has <span className="font-semibold">Request Purchase</span>. Reordering
        rules can auto-create requests when stock runs low, too.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default CreatingRequests;
