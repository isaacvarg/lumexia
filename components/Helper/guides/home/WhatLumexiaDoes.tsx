import { GuideTypo } from "../../typography";

const WhatLumexiaDoes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Every module hangs off the same chain — a purchase becomes stock, stock
        becomes a batch, a batch gets tested and priced.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item term="Inventory">
          the central record — every material and product, tracked as items and
          lots that everything else (BOMs, specs, pricing) hangs off.
        </GuideTypo.Item>
        <GuideTypo.Item term="Purchasing & Receiving">
          the procure-to-receive cycle — requests become purchase orders, and
          receiving books confirmed POs into stock as new, labeled lots.
        </GuideTypo.Item>
        <GuideTypo.Item term="Production">
          where an item is actually manufactured — an MBPR (master recipe) is
          run as a BPR (one batch), through planning, compounding, and
          production-quality verification.
        </GuideTypo.Item>
        <GuideTypo.Item term="Quality">
          specifications per item and examinations (test results) recorded
          against lots, plus a Micro area for outsourced microbiological
          testing.
        </GuideTypo.Item>
        <GuideTypo.Item term="Research & Development">
          where a formulation is developed before it becomes a production
          recipe — Experiment → Variant (candidate formula) → Sample (physical,
          measured batch).
        </GuideTypo.Item>
        <GuideTypo.Item term="Accounting">
          the money side — PO reconciliation, margin-based pricing
          examinations, and a payment-methods catalog.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default WhatLumexiaDoes;
