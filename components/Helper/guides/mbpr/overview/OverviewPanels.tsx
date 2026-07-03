import { GuideTypo } from "../../../typography";

const OverviewPanels = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Overview tab stacks three read-only panels; edits happen in the wizard via
        the <span className="font-semibold">Edit MBPR</span> button.
      </GuideTypo.Lead>

      <GuideTypo.Section>The panels</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Basics">
          the produced item, the version&apos;s label, and its record status
          (active/archived).
        </GuideTypo.Item>
        <GuideTypo.Item term="Batch Sizes">
          every defined size; <span className="font-semibold">Set Active Size</span>{" "}
          chooses which one is active (only one can be).
        </GuideTypo.Item>
        <GuideTypo.Item term="Bill of Materials">
          the materials, each as a concentration, with a resolved{" "}
          <span className="font-mono">Quantity (lbs)</span> column.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The BOM <span className="font-mono">Quantity (lbs)</span> is computed from the{" "}
        <span className="font-semibold">active batch size</span>. Because an MBPR
        stores concentrations, absolute weights only make sense against a specific
        size — so an active batch size must be set for the quantities to resolve.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default OverviewPanels;
