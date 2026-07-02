import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Purchasing tab shows how the item is sourced — buying trends across
        suppliers and the purchase orders behind them.
      </GuideTypo.Lead>

      <GuideTypo.Note>
        This tab appears for <span className="font-semibold">purchased</span> items
        only. Produced items are made in-house and don&apos;t have a purchasing
        history.
      </GuideTypo.Note>

      <GuideTypo.Section>In this tab</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Trend cards summarizing purchases, quantity, spend, and pricing.
        </GuideTypo.Item>
        <GuideTypo.Item>
          A filterable table of the item&apos;s purchase orders.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
