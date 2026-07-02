import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Inventory tab is the stock control center for the item — where you see
        its position, manage its lots, and configure how it&apos;s replenished.
      </GuideTypo.Lead>

      <GuideTypo.Section>In this tab</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Six quantity cards summarizing the item&apos;s stock position.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The lots that make up that stock, each with its own details.
        </GuideTypo.Item>
        <GuideTypo.Item>A history of inventory audits.</GuideTypo.Item>
        <GuideTypo.Item>Supplier-specific discrete conversions.</GuideTypo.Item>
        <GuideTypo.Item>
          A reordering rule that automates audits and purchasing requests.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
