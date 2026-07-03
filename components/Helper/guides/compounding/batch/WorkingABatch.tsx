import { GuideTypo } from "../../../typography";

const WorkingABatch = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A batch flows from queued to done in one place — stage its materials, get them
        verified, then work its steps.
      </GuideTypo.Lead>

      <GuideTypo.Section>The path</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>
          From a queued batch, <span className="font-semibold">Begin Staging</span>{" "}
          moves it to Staging Materials.
        </GuideTypo.Step>
        <GuideTypo.Step>
          Stage each material (scan, weigh, optional photo) until every line is Staged
          and verified.
        </GuideTypo.Step>
        <GuideTypo.Step>
          Work the steps in order; when the last step completes, the batch is
          automatically marked <span className="font-semibold">Completed</span>.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Note>
        <span className="font-semibold">Active timers</span> (e.g. tank time) is a work
        in progress — the panel currently shows &quot;No active timers&quot; and
        isn&apos;t functional yet.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default WorkingABatch;
