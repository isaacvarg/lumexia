import { GuideTypo } from "../../../typography";

const LotsCreated = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Each received line becomes a new <span className="font-semibold">lot</span> of
        the item — real, trackable stock the rest of the system can transact against.
      </GuideTypo.Lead>

      <GuideTypo.Section>What the lot carries</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Quantity">
          stored in the item&apos;s inventory UOM, after any conversion.
        </GuideTypo.Item>
        <GuideTypo.Item term="Lot number">
          generated automatically from the item&apos;s reference code and the date.
        </GuideTypo.Item>
        <GuideTypo.Item term="Origin">
          recorded as this purchase order, so a lot always traces back to the receipt
          that created it.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Receiving captures <span className="font-semibold">no expiry date</span> — a
        lot carries only its number, quantity, and origin. If you track expiry, record
        it separately.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default LotsCreated;
