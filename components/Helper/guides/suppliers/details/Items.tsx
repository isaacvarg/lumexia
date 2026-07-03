import { GuideTypo } from "../../../typography";

const Items = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Items</span> tab is everything you&apos;ve
        ever bought from this supplier — answering how much and how often you buy each
        item.
      </GuideTypo.Lead>

      <GuideTypo.Section>How it works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The left side lists items supplied, sortable by name, quantity, or spend.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Selecting an item shows, for the chosen date range:{" "}
          <span className="font-semibold">Total Spent</span>,{" "}
          <span className="font-semibold">Last Price</span> per unit, the{" "}
          <span className="font-semibold">units</span> it was purchased in, and the
          number of <span className="font-semibold">purchases</span> — plus a price
          trend chart and a table of the orders for that item.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        This is the supplier-side view of the same history the item&apos;s own
        Purchasing tab shows from the item&apos;s side.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Items;
