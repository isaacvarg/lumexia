import { GuideTypo } from "../../../typography";

const BatchSizes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Batch Sizes step defines the sizes the item can be produced in. Each size
        ties the recipe to a physical vessel.
      </GuideTypo.Lead>

      <GuideTypo.Section>Each size</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Batch Size (lbs)">
          the total batch weight.
        </GuideTypo.Item>
        <GuideTypo.Item term="Tank Time">
          the time the batch occupies its vessel.
        </GuideTypo.Item>
        <GuideTypo.Item term="Compounding Vessel">
          chosen from the vessels whose capacity range contains the batch size — only
          vessels large enough, but not too large, are offered.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        An MBPR can define multiple batch sizes, but only{" "}
        <span className="font-semibold">one</span> is{" "}
        <span className="font-semibold">active</span> at a time. Setting a size active
        (<span className="font-semibold">Set As Active</span> in the wizard, or{" "}
        <span className="font-semibold">Set Active Size</span> on the detail page)
        deactivates the others. The active size drives the bill-of-material
        quantities, pricing, and trends.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default BatchSizes;
