import { GuideTypo } from "../../../typography";

const RequestingABatch = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Request Batch</span> opens a short wizard:
        pick the produced item, its <span className="font-semibold">active
        MBPR</span>, then a <span className="font-semibold">batch size</span> defined
        on that MBPR.
      </GuideTypo.Lead>

      <GuideTypo.Section>What submitting does</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Creates a new BPR in <span className="font-semibold">Draft</span> status.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Copies the MBPR&apos;s bill of materials into the batch, converting each
          line&apos;s <span className="font-mono">% w/w</span> concentration into an
          absolute quantity in pounds for the chosen size.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Generates the batch&apos;s per-run steps and actionables from the MBPR.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Creates a <span className="font-semibold">lot</span> for the produced item
          (at zero quantity) that the finished batch will fill.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Requesting a batch instantiates a ready-to-work draft from the master recipe —
        from there, planning works its material sufficiency and schedules it.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default RequestingABatch;
