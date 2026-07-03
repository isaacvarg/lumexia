import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Notes</span> tab collects the order&apos;s
        notes, split by <span className="font-semibold">who can see them</span> — the
        one distinction that matters here.
      </GuideTypo.Lead>

      <GuideTypo.Section>Why it matters</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Some notes are for your team only; others print on the PO the supplier
          receives. The <span className="font-semibold">Note visibility</span> guide
          spells out each type.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
