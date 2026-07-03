import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Research Settings → Batch Sizes</span>{" "}
        is a global list of presets — not tied to any one experiment — that
        automatically appear on every experiment&apos;s Cost tab.
      </GuideTypo.Lead>

      <GuideTypo.Section>Fields</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Label">
          e.g. &quot;Pilot batch&quot; — required, non-empty.
        </GuideTypo.Item>
        <GuideTypo.Item term="Quantity (lb)">
          must be a finite number greater than zero.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Each preset produces its own projected-total line on every
        experiment&apos;s Cost tab, computed as{" "}
        <span className="font-mono">
          projected $/lb (from Overhead) × quantity (lb)
        </span>{" "}
        — add a batch size once here instead of typing it into each experiment.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
