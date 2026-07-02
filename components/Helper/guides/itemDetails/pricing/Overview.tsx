import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Pricing tab is where the item&apos;s cost is examined and the
        adjustments that shape its price are configured.
      </GuideTypo.Lead>

      <GuideTypo.Section>In this tab</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          An overview of the last pricing examination.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The full table of examinations conducted for the item.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Item pricing properties — the cost adjustments applied downstream.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        New examinations are started from the{" "}
        <span className="font-semibold">New Examination</span> button.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
