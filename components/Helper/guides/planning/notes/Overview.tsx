import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Notes tab holds notes attached to this batch record.
      </GuideTypo.Lead>

      <GuideTypo.Section>Scope</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Context specific to this run — kept with the BPR.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
