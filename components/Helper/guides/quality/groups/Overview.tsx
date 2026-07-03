import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Groups</span> tab defines parameter sets
        tied to an examination type.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why they exist</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Groups control which parameters show up when you conduct an examination of a
          given type.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
