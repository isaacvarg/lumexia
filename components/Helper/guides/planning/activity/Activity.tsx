import { GuideTypo } from "../../../typography";

const Activity = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Activity records changes to the batch in order — status moves, edits, and
        completions — so its full history is traceable.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why it matters</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Useful for reconstructing what happened to a batch and when, especially if
          it goes off the happy path.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Activity;
