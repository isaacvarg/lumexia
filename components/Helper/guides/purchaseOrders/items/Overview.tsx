import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Items</span> tab is where most of the
        work happens — the line items being ordered. The order&apos;s header carries
        the actions that apply to the whole order, from any tab.
      </GuideTypo.Lead>

      <GuideTypo.Section>Header actions</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Next / Previous">
          advance or step back the order&apos;s pipeline stage.
        </GuideTypo.Item>
        <GuideTypo.Item term="PO">
          generate and download the purchase order PDF.
        </GuideTypo.Item>
        <GuideTypo.Item term="Receiving">
          hand the order to receiving once it&apos;s confirmed.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        See <span className="font-semibold">Line items</span> for entry mechanics and{" "}
        <span className="font-semibold">Pipeline &amp; PO document</span> for the
        header actions.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
