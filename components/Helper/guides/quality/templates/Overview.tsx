import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Templates</span> tab holds reusable sets
        of parameters you can attach to an item all at once.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why they exist</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Save yourself from adding parameters to an item one at a time.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
