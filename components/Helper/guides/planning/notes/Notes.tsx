import { GuideTypo } from "../../../typography";

const Notes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Notes let you record context on this specific batch — decisions, deviations,
        or anything worth keeping with the run.
      </GuideTypo.Lead>

      <GuideTypo.Section>Good to know</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          These are typed notes scoped to the BPR, separate from the MBPR&apos;s notes.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Notes;
