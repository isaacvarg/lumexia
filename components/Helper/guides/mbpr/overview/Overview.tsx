import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Overview tab is the MBPR at a glance — who it makes, the sizes it runs in,
        and what goes into it.
      </GuideTypo.Lead>

      <GuideTypo.Section>Three panels</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Basics">
          the produced item, version label, and record status.
        </GuideTypo.Item>
        <GuideTypo.Item term="Batch Sizes">
          the defined sizes, with a <span className="font-semibold">Set Active
          Size</span> control.
        </GuideTypo.Item>
        <GuideTypo.Item term="Bill of Materials">
          the materials and their resolved quantities.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Everything here is authored in the wizard — use the{" "}
        <span className="font-semibold">Edit MBPR</span> button to change it.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
