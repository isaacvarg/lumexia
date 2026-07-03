import { GuideTypo } from "../../../typography";

const AccountingDetail = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Accounting tab is split into three sub-tabs covering the money and the
        documents behind the order.
      </GuideTypo.Lead>

      <GuideTypo.Section>Sub-tabs</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Details">
          the payment detail — method and status that drive the board&apos;s
          Accounting tag.
        </GuideTypo.Item>
        <GuideTypo.Item term="Notes">
          accounting-specific notes, kept apart from the order&apos;s other notes.
        </GuideTypo.Item>
        <GuideTypo.Item term="Files">
          attached paperwork — invoices, receipts, and the like.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        This detail is what the Accounting module reconciles against, so keeping it
        current keeps the order&apos;s payment state accurate everywhere it&apos;s
        shown.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default AccountingDetail;
