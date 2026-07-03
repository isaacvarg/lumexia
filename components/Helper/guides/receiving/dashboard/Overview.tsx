import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Receiving is where goods arriving at the facility are counted in against
        their purchase orders and become new stock. This board gathers every order
        that&apos;s ready to receive.
      </GuideTypo.Lead>

      <GuideTypo.Section>The board</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Awaiting">
          orders that still have goods to receive.
        </GuideTypo.Item>
        <GuideTypo.Item term="Received">
          fully received orders, kept for reference and label reprinting.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Both tabs show <span className="font-mono">#</span>, Supplier, Status, and
        Updated; filter by Supplier and click a row to open its receiving page.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
