import { GuideTypo } from "../../../typography";

const RequestCards = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The detail page is a set of cards. Each is a workspace, not just a readout —
        here&apos;s what you can do from each.
      </GuideTypo.Lead>

      <GuideTypo.Section>Basics</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Requesting user and requested date, plus the editable{" "}
          <span className="font-semibold">Expected On</span> date range.
        </GuideTypo.Item>
        <GuideTypo.Item>
          <span className="font-semibold">Status</span> and{" "}
          <span className="font-semibold">Priority</span> are clickable to change,
          and <span className="font-semibold">Supplier Tags</span> are set here.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Linked work</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Linked Batches">
          batch production records that depend on the item; connect existing batches
          and see the total quantity needed.
        </GuideTypo.Item>
        <GuideTypo.Item term="Linked POs">
          purchase orders fulfilling the request; connect an existing PO or add a new
          one directly (seeded with the item), with a running total of quantity
          purchased.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Inventory</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Current">
          live stock —{" "}
          <span className="font-mono">
            On Hand / Allocated / Soft Allocated / Available / Soft Availability
          </span>{" "}
          — plus pending batches, purchases, and allocations; you can request an
          inventory audit.
        </GuideTypo.Item>
        <GuideTypo.Item term="Notes">
          the request&apos;s notes again, with a count.
        </GuideTypo.Item>
        <GuideTypo.Item term="Snapshot">
          inventory frozen as it was when the request was created, including any
          duplicate-request warning flags raised at that time.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The Snapshot is a historical record — it doesn&apos;t change as stock moves.
        Use <span className="font-semibold">Current</span> for today&apos;s numbers.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default RequestCards;
