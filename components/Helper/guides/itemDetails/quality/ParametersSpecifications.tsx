import { GuideTypo } from "../../../typography";

const ParametersSpecifications = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">parameter</span> is a reusable
        characteristic you measure (pH, assay) — the <em>what</em>. A{" "}
        <span className="font-semibold">specification</span> is that
        parameter&apos;s acceptable value on this specific item — the{" "}
        <em>what counts as passing</em>. Parameters are global vocabulary; specs
        live on the item&apos;s Quality tab.
      </GuideTypo.Lead>

      <GuideTypo.Section>Specifications</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Four types: <span className="font-semibold">Range</span> (min–max
          inclusive), <span className="font-semibold">Max</span> (≤),{" "}
          <span className="font-semibold">Min</span> (≥), and{" "}
          <span className="font-semibold">Single value</span> (exact match).
        </GuideTypo.Item>
        <GuideTypo.Item>
          Grouped by examination type, so an item can hold different values for
          in-process vs finished-product checks.
        </GuideTypo.Item>
        <GuideTypo.Item>
          A spec can be <span className="font-semibold">conditional</span> — pinned
          to specific input values (e.g. viscosity at a given temperature); it
          takes priority over the general fallback when its inputs match.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Each spec has a <span className="font-semibold">Display on COA</span>{" "}
          toggle controlling its appearance on certificates.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Quality values are stored free-form and deliberately aren&apos;t run
        through unit conversions — the unit is just a label. If a value can&apos;t
        be compared to a limit, the result is{" "}
        <span className="font-semibold">unknown</span>, not pass/fail.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ParametersSpecifications;
