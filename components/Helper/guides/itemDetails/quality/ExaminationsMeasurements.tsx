import { GuideTypo } from "../../../typography";

const ExaminationsMeasurements = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An <span className="font-semibold">examination</span> records the
        item&apos;s measured values against its specifications and ends in a
        verdict. It&apos;s always tied to a{" "}
        <span className="font-semibold">lot</span>, never directly to the item —
        quality is proven lot by lot.
      </GuideTypo.Lead>

      <GuideTypo.Section>How it works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Types — <span className="font-semibold">Dry</span>,{" "}
          <span className="font-semibold">In-Process</span>,{" "}
          <span className="font-semibold">Finished Product</span>, and{" "}
          <span className="font-semibold">Legacy Data</span> — determine which
          parameters appear and which specs apply.
        </GuideTypo.Item>
        <GuideTypo.Item>
          A parameter can hold multiple{" "}
          <span className="font-semibold">runs</span> when a test is repeated; each
          value shows a live PASS / FAIL / UNKNOWN badge.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The overall verdict is <span className="font-semibold">Pass</span> or{" "}
          <span className="font-semibold">Out of Specification</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A certificate of analysis is generated from the lot (not here), requires a
        Finished Product examination, and includes only the specs flagged Display
        on COA.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ExaminationsMeasurements;
