import { GuideTypo } from "../../../typography";

const TheQualityModule = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Quality is built from three pieces that build on each other — plus a separate
        Micro area for testing sent out to a lab.
      </GuideTypo.Lead>

      <GuideTypo.Section>The pieces</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Parameters">
          the measurable characteristics you test (pH, assay, appearance) — the shared
          vocabulary.
        </GuideTypo.Item>
        <GuideTypo.Item term="Specifications">
          per-item acceptable values that define what passing looks like; managed on
          the item&apos;s Quality tab, not here.
        </GuideTypo.Item>
        <GuideTypo.Item term="Examinations">
          recorded test events against a lot; entered values are checked against the
          item&apos;s specifications.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        In the interface a recorded test event is always called an{" "}
        <span className="font-semibold">examination</span>. The QC area lives at{" "}
        <span className="font-mono">/quality/qc</span>, with Micro separately at{" "}
        <span className="font-mono">/quality/micro</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default TheQualityModule;
