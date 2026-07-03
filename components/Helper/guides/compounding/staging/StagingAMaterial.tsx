import { GuideTypo } from "../../../typography";

const StagingAMaterial = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Open a material from the Not Started list and work the wizard. Each staged
        weight is recorded against the batch.
      </GuideTypo.Lead>

      <GuideTypo.Section>The steps</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>
          <span className="font-semibold">Scan</span> the lot&apos;s barcode — it must
          be a lot of the required item, or Lumexia rejects it.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Enter the weight</span> in pounds — there
          must be enough on hand, and it must fall within a{" "}
          <span className="font-mono">±1.5%</span> tolerance of the required quantity.
        </GuideTypo.Step>
        <GuideTypo.Step>
          Optionally attach a <span className="font-semibold">photo</span> of the
          staged material.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Note>
        A material can be staged in <span className="font-semibold">more than one
        pull</span> until its total is within tolerance. Once fully staged, its line
        moves to <span className="font-semibold">Staged</span>, ready for verification.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default StagingAMaterial;
