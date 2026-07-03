import { GuideTypo } from "../../../../typography";

const PricingExamTrigger = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Every Item Type carries a toggle — labeled{" "}
        <span className="font-mono">Triggers Pricing Exam</span> — that decides
        whether receiving an item of that type automatically queues it for
        pricing.
      </GuideTypo.Lead>

      <GuideTypo.Section>The causal chain</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>
          You enable the toggle on an Item Type (e.g. &quot;Raw Materials&quot;).
        </GuideTypo.Step>
        <GuideTypo.Step>
          Nothing happens yet — the toggle is only read at{" "}
          <span className="font-semibold">reception</span> time, not when you
          edit an item or the item type itself.
        </GuideTypo.Step>
        <GuideTypo.Step>
          When a PO item of that type is received, the receiving flow checks the
          toggle and, if on, automatically enqueues the item into the pricing
          queue — no manual step required.
        </GuideTypo.Step>
        <GuideTypo.Step>
          An activity entry is logged on the item noting it was added to the
          pricing queue from PO reception.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Note>
        The label reads &quot;Triggers Pricing Exam&quot; in the edit list but
        &quot;Triggerts Pricing Examination&quot; on the add form — a known typo,
        not two different settings.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default PricingExamTrigger;
