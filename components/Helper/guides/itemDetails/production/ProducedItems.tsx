import { GuideTypo } from "../../../typography";

const ProducedItems = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        For a produced item, the Production tab is about how the item is made — its
        recipe and the runs that have manufactured it.
      </GuideTypo.Lead>

      <GuideTypo.Section>Master batch record (MBPR)</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The MBPR is the master recipe template. An item can hold several
          versions, but only <span className="font-semibold">one</span> should be
          active at a time.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Materials are stored as concentrations (
          <span className="font-mono">% w/w</span>); the bill of materials resolves
          to pounds from the active batch size, so a size must be set for weights to
          appear.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Batches produced</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each batch (BPR) is one concrete run instantiated from the active MBPR at
          a chosen size, which copies the BOM into per-run steps and creates a
          zero-quantity lot to fill.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Materials aren&apos;t consumed from inventory until the batch is handled
          (Completed → Awaiting QC).
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default ProducedItems;
