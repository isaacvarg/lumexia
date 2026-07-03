import { GuideTypo } from "../../../typography";

const TheRecord = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Basics holds the experiment&apos;s core fields plus its own notes and files.
      </GuideTypo.Lead>

      <GuideTypo.Section>Fields & panels</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Status, group, objective, hypothesis">
          the experiment&apos;s identity, edited here.
        </GuideTypo.Item>
        <GuideTypo.Item term="Notes">
          each has a color-coded <span className="font-semibold">note type</span> (e.g.
          Observation, Decision), an author, and content.
        </GuideTypo.Item>
        <GuideTypo.Item term="Files">
          documents or images attached to the experiment.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Note types are <span className="font-semibold">shared</span> across experiment
        notes and sample notes, so the same labels are available wherever a note is
        written; both feed the aggregated Notes and Files tabs.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default TheRecord;
