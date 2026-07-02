import { GuideTypo } from "../../../typography";

const PurchasedItems = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        For a purchased item, the Production tab shows how the item is consumed —
        where it appears as an ingredient across production. It&apos;s the mirror
        image of the produced view: rather than a recipe for making the item, you
        see the products whose recipes include it.
      </GuideTypo.Lead>

      <GuideTypo.Section>In production</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The item shows up as a <span className="font-mono">% w/w</span> material
          line in other items&apos; MBPR steps.
        </GuideTypo.Item>
        <GuideTypo.Item>
          On a batch, each material carries a{" "}
          <span className="font-semibold">sufficiency</span> verdict — enough
          (green), enough for this batch but not once other drafts count (yellow),
          or not enough (red).
        </GuideTypo.Item>
        <GuideTypo.Item>
          The material allocations view breaks down On Hand, Allocated, and Soft
          Allocated against what the batch requires — mirroring the inventory
          quantity cards — and lets you raise an audit or purchasing request on a
          shortfall.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default PurchasedItems;
