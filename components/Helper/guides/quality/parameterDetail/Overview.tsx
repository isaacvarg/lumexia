import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A parameter&apos;s configuration page gathers everything about it in four
        cards, side by side.
      </GuideTypo.Lead>

      <GuideTypo.Section>The cards</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Basics">name, description, unit, data type.</GuideTypo.Item>
        <GuideTypo.Item term="Groups & Templates">
          which groups and templates this parameter belongs to.
        </GuideTypo.Item>
        <GuideTypo.Item term="Input Definitions">
          the extra sub-inputs captured alongside a reading.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
