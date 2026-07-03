import { GuideTypo } from "../../../typography";

const BatchLifecycle = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A batch moves through a defined set of statuses. Most transitions happen
        automatically as work completes; the manual{" "}
        <span className="font-semibold">Change Status To…</span> dialog is for
        exceptions.
      </GuideTypo.Lead>

      <GuideTypo.Section>The everyday flow</GuideTypo.Section>
      <GuideTypo.Paragraph>
        <span className="font-mono">
          Draft → Queued → Staging Materials → Compounding → Completed → Awaiting QC →
          Released
        </span>
        .
      </GuideTypo.Paragraph>
      <GuideTypo.List>
        <GuideTypo.Item term="Draft">
          created by Request Batch; planning sorts material sufficiency (with interim
          states like Allocating Materials or Awaiting Materials).
        </GuideTypo.Item>
        <GuideTypo.Item term="Queued">confirmed and scheduled, ready to stage.</GuideTypo.Item>
        <GuideTypo.Item term="Staging → Compounding → Completed">
          worked on the compounding floor.
        </GuideTypo.Item>
        <GuideTypo.Item term="Awaiting QC → Released">
          quality-tested, then cleared for use or sale.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Off the happy path are{" "}
        <span className="font-mono">Investigating / Corrective Actions</span>,{" "}
        <span className="font-mono">Failed</span>, and{" "}
        <span className="font-mono">Consumption Error</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default BatchLifecycle;
