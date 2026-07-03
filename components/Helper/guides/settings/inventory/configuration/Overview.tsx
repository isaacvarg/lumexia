import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">
          Inventory Settings → Configuration
        </span>{" "}
        is five independent panels — the categorization schemes that everything
        else in Inventory is built from.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item term="Inventory Types">
          not free-form — the app is hard-limited to exactly two, Tracked and Not
          Tracked. You can only rename them, not add or remove.
        </GuideTypo.Item>
        <GuideTypo.Item term="Procurement Types">
          a read-only reference: Purchased and Produced. No form, no state —
          purely informational.
        </GuideTypo.Item>
        <GuideTypo.Item term="Alias Types">
          CRUD list of the categories an item alias can belong to. The Supplier
          alias type is required and hidden from the edit/delete list.
        </GuideTypo.Item>
        <GuideTypo.Item term="Item Types">
          CRUD list of collections items are grouped into — and where the
          pricing-examination trigger lives (see the linked guide).
        </GuideTypo.Item>
        <GuideTypo.Item term="File Types">
          CRUD list of categories for files uploaded to an item (COAs, SDS,
          specs…), each with a background/text color pair used for its badge.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Deleting an Alias Type or UOM that&apos;s currently in use is rejected
        server-side with a surfaced error — deletion isn&apos;t silently blocked,
        but it isn&apos;t silently allowed either.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
