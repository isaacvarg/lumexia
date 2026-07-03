import { GuideTypo } from "../../../typography";

const HandlingCompleted = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        When a batch finishes compounding it becomes{" "}
        <span className="font-semibold">Completed</span>, but its materials aren&apos;t
        consumed from inventory until you run the completion step.
      </GuideTypo.Lead>

      <GuideTypo.Section>Handle Completed BPRS</GuideTypo.Section>
      <GuideTypo.Paragraph>
        The dashboard button processes every completed batch at once:
      </GuideTypo.Paragraph>
      <GuideTypo.List>
        <GuideTypo.Item>
          Creates inventory consumption transactions for each staged material.
        </GuideTypo.Item>
        <GuideTypo.Item>Marks the batch&apos;s materials as consumed.</GuideTypo.Item>
        <GuideTypo.Item>
          Advances each batch from <span className="font-semibold">Completed</span> to{" "}
          <span className="font-semibold">Awaiting QC</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        If consumption fails, the batch moves to{" "}
        <span className="font-mono">Consumption Error</span> with a note; a per-batch{" "}
        <span className="font-semibold">Retry Consumption</span> button on the Status
        card re-runs it once fixed. The action is safe to re-run — it cleans up any
        prior consumption first.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default HandlingCompleted;
