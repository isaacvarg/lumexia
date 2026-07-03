import { GuideTypo } from "../../../typography";

const TriggersAndLifecycle = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An examination can start three ways, then moves through a small set of statuses.
      </GuideTypo.Lead>

      <GuideTypo.Section>What triggers one</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Automatically on reception">
          when an item is received, if its item type has the pricing-examination trigger
          enabled (Settings &gt; Inventory &gt; Item Types).
        </GuideTypo.Item>
        <GuideTypo.Item term="Manually">
          <span className="font-semibold">Begin Pricing Examination</span> on the landing
          page.
        </GuideTypo.Item>
        <GuideTypo.Item term="After a rejection">
          rejecting an examination queues a fresh one for the same item.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Lifecycle</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          <span className="font-mono">Queued → Pending Review → Approved / Rejected</span>{" "}
          — queued waits to be conducted, pending review awaits a decision, approved
          means the recomputed prices stand.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default TriggersAndLifecycle;
