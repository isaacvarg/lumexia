import { GuideTypo } from "../../../typography";

const WorkingAStep = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Steps are worked in order. On the current step, staff read the detail, check
        off materials, and complete every actionable.
      </GuideTypo.Lead>

      <GuideTypo.Section>Completing a step</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Check off each material">
          only possible once it&apos;s <span className="font-semibold">secondary
          verified</span> — until then it shows &quot;Awaiting verification&quot;.
        </GuideTypo.Item>
        <GuideTypo.Item term="Complete each actionable">
          entering the value its type calls for — a yes/no check, a number, a photo, or
          a note.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Paragraph>
        <span className="font-semibold">Complete Step</span> becomes available only
        when the prior steps are done, every material is checked off, and every
        actionable is complete. Completing the last step auto-marks the batch{" "}
        <span className="font-semibold">Completed</span>.
      </GuideTypo.Paragraph>

      <GuideTypo.Note>
        A step can be <span className="font-semibold">locked</span> — showing{" "}
        <span className="font-mono">STEP IS LOCKED</span> — while the previous step
        still has actionables awaiting Production Quality verification.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default WorkingAStep;
