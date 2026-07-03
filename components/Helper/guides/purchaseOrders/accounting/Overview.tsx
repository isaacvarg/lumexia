import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Accounting</span> tab holds the
        order&apos;s payment and paperwork detail — the bridge between the purchase
        order and reconciliation in the Accounting module.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it feeds</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Its state surfaces as the board&apos;s{" "}
          <span className="font-semibold">Accounting</span> tag, which stays blank
          until accounting is started.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
