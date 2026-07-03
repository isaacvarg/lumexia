import { GuideTypo } from "../../../typography";

const ExaminationRecord = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Opening an examination shows its full record — a header plus the same views
        used to conduct it, in read-only form.
      </GuideTypo.Lead>

      <GuideTypo.Section>The record</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Header">
          item, lot, conducted by, type, and status.
        </GuideTypo.Item>
        <GuideTypo.Item term="Results / Notes / Attachments">
          each parameter&apos;s recorded runs with their pass/fail badges, plus any
          notes and files.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Status reflects where it is: <span className="font-mono">open</span> while in
        progress, then <span className="font-mono">pass</span> or{" "}
        <span className="font-mono">out of specification</span> once a verdict is set.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ExaminationRecord;
