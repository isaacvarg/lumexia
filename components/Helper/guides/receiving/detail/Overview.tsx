import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An order&apos;s receiving page is where you count its line items into stock.
        The lines are split into two sections by what&apos;s left to do.
      </GuideTypo.Lead>

      <GuideTypo.Section>The two sections</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Receivables">
          lines not yet received — the action area where you book goods in.
        </GuideTypo.Item>
        <GuideTypo.Item term="Received">
          lines already received — where you print labels for the resulting lots.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The table shows the <span className="font-semibold">supplier&apos;s</span>{" "}
        name for an item when a supplier alias exists (that&apos;s what&apos;s on the
        physical shipment); an icon reveals an Aliases tooltip listing every other
        name, including your true item name.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
