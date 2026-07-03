import { GuideTypo } from "../../../typography";

const BillOfMaterials = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The bill-of-materials table lists every material the batch needs and whether
        there&apos;s enough stock. Its columns change with the batch&apos;s status.
      </GuideTypo.Lead>

      <GuideTypo.Section>Columns by status</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Draft">
          shows required and available amounts plus a sufficiency verdict.
        </GuideTypo.Item>
        <GuideTypo.Item term="Past Draft">
          adds <span className="font-mono">Staged</span>,{" "}
          <span className="font-mono">1° Verification</span>, and{" "}
          <span className="font-mono">2° Verification</span> columns tracking staging
          progress on the floor.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Sufficiency flag</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          <span className="font-semibold">Green check</span> — enough on hand.
        </GuideTypo.Item>
        <GuideTypo.Item>
          <span className="font-semibold">Yellow triangle</span> — enough for this
          batch, but not once other draft batches are counted.
        </GuideTypo.Item>
        <GuideTypo.Item>
          <span className="font-semibold">Red X</span> — not enough on hand.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Each material line also carries its own status as it&apos;s staged:{" "}
        <span className="font-mono">
          Pending → Staged → Primary Verified → Secondary Verified → Consumed
        </span>
        .
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default BillOfMaterials;
