import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The wizard is where you author and edit a recipe. It&apos;s reached from{" "}
        <span className="font-semibold">Create or Modify MBPR</span> on the list or{" "}
        <span className="font-semibold">Edit MBPR</span> on a detail page.
      </GuideTypo.Lead>

      <GuideTypo.Section>Four steps</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>
          <span className="font-semibold">Item</span> — choose the produced item.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Version</span> — choose or create a version.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Production</span> — build the steps,
          materials, and instructions.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Batch Sizes</span> — define the sizes it can
          run in.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Note>
        Changes are saved as you make them — there is{" "}
        <span className="font-semibold">no single final submit</span>. The guides here
        cover versions, steps &amp; actions, and batch sizes, including the rules that
        gate each.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
