import { GuideTypo } from "../../../typography";

const LotsCreated = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Each supplier lot received becomes a new <span className="font-semibold">lot</span>{" "}
        of the item — real, trackable stock the rest of the system can transact against.
      </GuideTypo.Lead>

      <GuideTypo.Section>What the lot carries</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Quantity">
          stored in the item&apos;s inventory UOM, after any conversion.
        </GuideTypo.Item>
        <GuideTypo.Item term="Lot number">
          generated automatically from the item&apos;s reference code and the date.
        </GuideTypo.Item>
        <GuideTypo.Item term="Supplier lot">
          the supplier&apos;s lot number, plus expiry and manufacture dates when entered.
        </GuideTypo.Item>
        <GuideTypo.Item term="Origin">
          this purchase order and delivery, so a lot always traces back to the receipt,
          inspection and paperwork that came with it.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The lot&apos;s <span className="font-semibold">Receiving</span> card on the item
        page shows how it came in and lets you correct the supplier lot or dates.
        Setting a supplier lot there attaches documents that were waiting for it.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default LotsCreated;
