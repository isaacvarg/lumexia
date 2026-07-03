import { GuideTypo } from "../../../typography";

const MaterialAllocations = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Clicking a material row opens its{" "}
        <span className="font-semibold">Material Allocations</span> dialog — exactly
        where the item stands, every amount in pounds.
      </GuideTypo.Lead>

      <GuideTypo.Section>The amounts</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="On Hand">physical quantity across all lots.</GuideTypo.Item>
        <GuideTypo.Item term="Allocated (Other Batches)">
          committed to other confirmed batches (excludes this one).
        </GuideTypo.Item>
        <GuideTypo.Item term="Soft Allocated (Other Batches)">
          committed to other draft batches not yet confirmed.
        </GuideTypo.Item>
        <GuideTypo.Item term="Required for this Batch">
          how much this batch needs.
        </GuideTypo.Item>
        <GuideTypo.Item term="Available after this Batch">
          <span className="font-mono">
            On Hand − other allocations − this batch&apos;s requirement
          </span>
          .
        </GuideTypo.Item>
        <GuideTypo.Item term="Soft Availability after this Batch">
          the above, minus other drafts&apos; soft allocations.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The dialog also lists active purchasing requests, allocations, and POs for the
        material, and lets you act on a shortfall directly —{" "}
        <span className="font-semibold">Request Inventory Audit</span> or raise a{" "}
        <span className="font-semibold">purchasing request</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default MaterialAllocations;
