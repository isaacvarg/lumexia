import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Inventory Settings → Triggers</span>{" "}
        configures the weekly cron that automatically flags items for an{" "}
        <span className="font-mono">AuditRequest</span> — it does not create audits
        itself, it decides which items are candidates.
      </GuideTypo.Lead>

      <GuideTypo.Section>Three independent triggers</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Low on-hand, no rule">
          toggle (default on) + ratio (default{" "}
          <span className="font-mono">0.05</span>). Only applies to items with{" "}
          <span className="font-semibold">zero active reordering rules</span>;
          flags a lot when{" "}
          <span className="font-mono">
            totalQuantityOnHand &lt; ratio × lot.initialQuantity
          </span>
          .
        </GuideTypo.Item>
        <GuideTypo.Item term="High BPR usage">
          toggle (default on) + integer threshold (default{" "}
          <span className="font-mono">2</span>). Flags an item consumed by more
          distinct BPRs than the threshold.
        </GuideTypo.Item>
        <GuideTypo.Item term="Negative stock">
          toggle (default on), no threshold — any lot with{" "}
          <span className="font-mono">totalQuantityOnHand &lt; 0</span> is
          flagged.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        If all three top-level toggles are off, the cron no-ops entirely — it
        doesn&apos;t even evaluate the category gate below.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
