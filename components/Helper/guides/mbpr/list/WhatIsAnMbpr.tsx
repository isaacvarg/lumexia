import { GuideTypo } from "../../../typography";

const WhatIsAnMbpr = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">Master Batch Production Record</span> is the
        reusable <span className="font-semibold">template</span> for producing one
        item — the recipe. You write it once, and every batch of that item is
        instantiated from it.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it holds</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The bill of materials, stored as{" "}
          <span className="font-semibold">concentrations</span> (
          <span className="font-mono">% w/w</span>).
        </GuideTypo.Item>
        <GuideTypo.Item>The ordered steps and their instructions.</GuideTypo.Item>
        <GuideTypo.Item>The batch sizes the item can be made in.</GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>MBPR vs BPR</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="MBPR">
          the recipe — materials as percentages and templated steps.
        </GuideTypo.Item>
        <GuideTypo.Item term="BPR">
          one run of that recipe at a chosen batch size; creating it resolves the
          concentrations into concrete <span className="font-semibold">pounds</span>{" "}
          and per-run tasks.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The MBPR is the recipe; the BPR is one time you cook it — so{" "}
        <span className="font-semibold">one MBPR yields many BPRs</span>. BPRs are
        created and worked in <span className="font-semibold">Planning</span>, one of
        production&apos;s four areas alongside MBPR, Compounding, and Production
        Quality.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default WhatIsAnMbpr;
