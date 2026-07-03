import { GuideTypo } from "../../../typography";

const AnalogFromMbpr = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A variant can be built from scratch or cloned from an existing MBPR with{" "}
        <span className="font-semibold">Add Analog</span> — the fastest way to start
        from a recipe the facility already produces and then tweak it.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it copies</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Materials">
          every BOM line, converted from the MBPR&apos;s percentage into the
          variant&apos;s fractional concentration, ordered by step, tagged with each
          material&apos;s step phase.
        </GuideTypo.Item>
        <GuideTypo.Item term="Method">
          the MBPR&apos;s active step instructions, flattened into ordered method steps
          (archived steps and instructions are skipped).
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        An analog is a <span className="font-semibold">one-time copy, not a live
        link</span> — editing the variant doesn&apos;t change the MBPR, and later MBPR
        changes don&apos;t flow back. The recorded <span className="font-semibold">source
        MBPR</span> only exists so the experiment shows up on that MBPR&apos;s R&amp;D
        tab.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default AnalogFromMbpr;
