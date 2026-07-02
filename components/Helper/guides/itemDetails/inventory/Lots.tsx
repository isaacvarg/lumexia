import { GuideTypo } from "../../../typography";

const Lots = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">lot</span> is one physical batch of the
        item — the units from a single delivery, or the output of one production
        run. The table lists every lot; create one with the{" "}
        <span className="font-semibold">+</span> button and filter out depleted
        lots to focus on what&apos;s active.
      </GuideTypo.Lead>

      <GuideTypo.Section>Lot numbers</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Auto-generated from receiving, production, or manual creation — you never
          type them.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Pattern:{" "}
          <span className="font-mono">
            &lt;reference code&gt;.&lt;serial&gt;&lt;month letter&gt;&lt;DD&gt;&lt;YY&gt;
          </span>{" "}
          (e.g. <span className="font-mono">BASE1234.A12A0124</span> = Jan 01,
          2024). The serial is random, not sequential — it only keeps same-day lots
          unique.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Lot details</GuideTypo.Section>
      <GuideTypo.Paragraph>Click a lot to open it. From there you can:</GuideTypo.Paragraph>
      <GuideTypo.List>
        <GuideTypo.Item term="Print Label">
          lot number, item name, generation timestamp, and a QR code. The QR
          encodes the lot&apos;s internal ID (not the printed number), so scans
          always resolve to the exact record.
        </GuideTypo.Item>
        <GuideTypo.Item term="Generate COA">
          a certificate of analysis, available only once a QC examination exists
          for the lot.
        </GuideTypo.Item>
        <GuideTypo.Item term="Create Transaction">
          deplete, add/subtract, or set the lot&apos;s available quantity.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>What a lot shows</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Lot Info">
          origin (the purchase order or batch record that created it), creation
          time, and initial quantity.
        </GuideTypo.Item>
        <GuideTypo.Item term="Lot Notes">
          notes scoped only to that lot, with their own note types.
        </GuideTypo.Item>
        <GuideTypo.Item term="Transactions">
          every transaction recorded against the lot.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Lots;
