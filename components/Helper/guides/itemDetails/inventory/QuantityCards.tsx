import { GuideTypo } from "../../../typography";

const QuantityCards = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Six figures summarize where the item&apos;s stock stands at a glance.
      </GuideTypo.Lead>

      <GuideTypo.Section>What each one means</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="On Hand">
          the physical quantity currently in stock across all of the item&apos;s
          lots.
        </GuideTypo.Item>
        <GuideTypo.Item term="On Order">
          quantity from open purchase orders that hasn&apos;t been received yet.
        </GuideTypo.Item>
        <GuideTypo.Item term="Allocated">
          quantity committed to confirmed batches that haven&apos;t consumed their
          materials yet. This is a firm hold on stock.
        </GuideTypo.Item>
        <GuideTypo.Item term="Soft Allocated">
          quantity claimed by draft batches that aren&apos;t confirmed yet. It
          becomes Allocated once the batch is confirmed.
        </GuideTypo.Item>
        <GuideTypo.Item term="Available">
          what&apos;s free to commit right now:{" "}
          <span className="font-mono">On Hand − Allocated</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Soft Availability">
          what would be left if every current draft batch were confirmed:{" "}
          <span className="font-mono">On Hand − Allocated − Soft Allocated</span>.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Firm vs. planned commitments</GuideTypo.Section>
      <GuideTypo.Paragraph>
        A batch starts as a draft — a plan that might still change — so its
        materials are only{" "}
        <span className="font-semibold">soft allocated</span>. Once the batch is
        confirmed, that stock becomes{" "}
        <span className="font-semibold">allocated</span> (a hard hold) and
        Available drops. Tracking both lets you see firm commitments (Available)
        and planned commitments (Soft Availability) side by side.
      </GuideTypo.Paragraph>

      <GuideTypo.Note>
        On Hand isn&apos;t a stored number — it&apos;s recomputed from each
        lot&apos;s starting quantity plus every transaction against it, so it can
        always be explained. Clicking the{" "}
        <span className="font-semibold">On Order</span> card reveals the purchase
        orders behind it.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default QuantityCards;
