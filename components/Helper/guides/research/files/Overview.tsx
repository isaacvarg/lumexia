import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Files tab is an <span className="font-semibold">aggregated list</span> of
        every file attached anywhere in the experiment.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why it helps</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Find any document or image without opening each sample.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
