import { GuideTypo } from "../../../typography";

const Activity = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Activity records changes to the MBPR in order, so the recipe&apos;s history is
        always traceable.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why it matters</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Because every batch is instantiated from this master record, knowing when it
          changed helps explain differences between batches made at different times.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Activity;
