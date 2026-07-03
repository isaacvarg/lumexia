import { GuideTypo } from "../../../typography";

const CostProjections = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        For each variant, Lumexia works out a projected{" "}
        <span className="font-semibold">cost per pound</span> from material prices plus
        overhead.
      </GuideTypo.Lead>

      <GuideTypo.Section>How it&apos;s built</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Material cost">
          each item&apos;s purchased cost per pound (from accounting pricing) ×
          its concentration, summed to a{" "}
          <span className="font-mono">BOM cost/lb</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Overhead">
          the BOM cost is marked up by an <span className="font-semibold">overhead
          percent</span>, plus a flat <span className="font-semibold">overhead per
          pound</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Sizes & comparison</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Projected across the configured <span className="font-semibold">cost batch
          sizes</span> (costing-only — independent of an MBPR&apos;s production sizes).
        </GuideTypo.Item>
        <GuideTypo.Item>
          When the subject has been produced, a <span className="font-semibold">delta</span>{" "}
          compares each variant to its last produced cost/lb — negative means cheaper.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A material with <span className="font-semibold">no price</span> on file is
        treated as zero and flagged, so the projection understates the true cost — price
        the flagged materials in accounting to firm it up. Overhead and batch sizes are
        global R&amp;D settings at <span className="font-mono">/settings/research</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default CostProjections;
