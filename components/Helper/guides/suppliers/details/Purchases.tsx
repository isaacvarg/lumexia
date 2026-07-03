import { GuideTypo } from "../../../typography";

const Purchases = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Purchases</span> is the default tab and the
        home for spend analytics — how much you buy from this supplier and how it
        trends.
      </GuideTypo.Lead>

      <GuideTypo.Section>Metrics</GuideTypo.Section>
      <GuideTypo.Paragraph>
        A panel with an <span className="font-mono">All / This Year / Last Year</span>{" "}
        toggle shows three figures:
      </GuideTypo.Paragraph>
      <GuideTypo.List>
        <GuideTypo.Item term="Purchase Orders">
          the count of orders in range.
        </GuideTypo.Item>
        <GuideTypo.Item term="Total Spent">
          the summed value of those orders.
        </GuideTypo.Item>
        <GuideTypo.Item term="Avg. Order Value">
          <span className="font-mono">Total Spent ÷ order count</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Below the metrics and spend-over-time chart is a table of every purchase order
        for the supplier, filterable by status and payment method, each row linking to
        the order.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Purchases;
