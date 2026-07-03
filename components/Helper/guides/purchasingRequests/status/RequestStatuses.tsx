import { GuideTypo } from "../../../typography";

const RequestStatuses = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A request moves through a fixed pipeline of{" "}
        <span className="font-semibold">15 statuses</span>, from{" "}
        <span className="font-mono">Requested</span> all the way to{" "}
        <span className="font-mono">Delivered</span>. Status and priority are set
        from the request&apos;s Basics card.
      </GuideTypo.Lead>

      <GuideTypo.Section>The pipeline</GuideTypo.Section>
      <GuideTypo.Paragraph>
        In order:{" "}
        <span className="font-mono">
          Requested → On Hold → Replacement Ingredient Testing → Pricing Requested →
          Allocating Ingredients → PO Pending → PO Confirmed → Expected Delivery Date
          → No ETA → Delivered-Issue → Partial Delivery → Request Cancelled-Duplicate
          → Discontinued Ingredient → Replacement Ingredient Found → Delivered
        </span>
        .
      </GuideTypo.Paragraph>

      <GuideTypo.Section>Finished states</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Four statuses are <span className="font-semibold">finished</span> and drop
          the request off the main board into the Archive:{" "}
          <span className="font-mono">Delivered</span>,{" "}
          <span className="font-mono">Request Cancelled-Duplicate</span>,{" "}
          <span className="font-mono">Discontinued Ingredient</span>, and{" "}
          <span className="font-mono">Replacement Ingredient Found</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The <span className="font-semibold">Archive</span> button in the header opens
        a single searchable, sortable table that merges standard and general
        requests — reference number, name, status, requester, created date, and type.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default RequestStatuses;
