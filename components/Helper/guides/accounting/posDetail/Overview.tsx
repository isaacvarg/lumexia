import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A PO&apos;s accounting detail is where its reconciliation lives — the toggles,
        status, payment method, paperwork, and a shared audit trail.
      </GuideTypo.Lead>

      <GuideTypo.Section>Four tabs</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Details">
          the reconciliation toggles, PO info, status, and payment method.
        </GuideTypo.Item>
        <GuideTypo.Item term="Notes">typed notes with attachments.</GuideTypo.Item>
        <GuideTypo.Item term="Files">digital copies of the paperwork.</GuideTypo.Item>
        <GuideTypo.Item term="Activity">the merged audit timeline.</GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
