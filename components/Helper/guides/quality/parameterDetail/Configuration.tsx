import { GuideTypo } from "../../../typography";

const Configuration = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        This page is where a single parameter is fully configured — its basics, its
        memberships, and the sub-inputs it captures.
      </GuideTypo.Lead>

      <GuideTypo.Section>What you manage</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Basics">
          name, description, unit of measurement, data type, and the Is Wet flag.
        </GuideTypo.Item>
        <GuideTypo.Item term="Groups & Templates">
          membership on both — editable from here or from the group/template itself.
        </GuideTypo.Item>
        <GuideTypo.Item term="Input Definitions">
          extra sub-inputs (e.g. temperature, wavelength) recorded with the main value,
          each with a name, label, data type, optional unit, and Required flag.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Input definitions later appear as additional fields when a value is recorded
        during an examination, and specifications can be pinned to specific
        input-definition values.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Configuration;
