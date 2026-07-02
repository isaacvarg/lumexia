import { GuideTypo } from "../../../typography";

const Trends = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The trend cards summarize the item&apos;s buying history. The{" "}
        <span className="font-semibold">All</span>,{" "}
        <span className="font-semibold">This Year</span>,{" "}
        <span className="font-semibold">Last Year</span>, and{" "}
        <span className="font-semibold">Select Year</span> filters change the data
        feeding every card.
      </GuideTypo.Lead>

      <GuideTypo.Section>The cards</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Purchases Count">
          POs per supplier, with an overall total.
        </GuideTypo.Item>
        <GuideTypo.Item term="Quantity">
          quantity ordered (converted to inventory UOM) per supplier, with an
          overall total.
        </GuideTypo.Item>
        <GuideTypo.Item term="Spent">
          amount spent on the item per supplier, with an overall total.
        </GuideTypo.Item>
        <GuideTypo.Item term="Pricing Stats">
          last, lowest, highest, and average price per supplier, plus the global
          highest and lowest prices.
        </GuideTypo.Item>
        <GuideTypo.Item term="Frequency Trends">
          a chart of quantity versus month and year.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Trends;
