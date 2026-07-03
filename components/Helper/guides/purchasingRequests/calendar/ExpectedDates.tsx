import { GuideTypo } from "../../../typography";

const ExpectedDates = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Where a request lands on the calendar comes from its{" "}
        <span className="font-semibold">Expected On</span> date range, an editable
        window on the request&apos;s Basics card.
      </GuideTypo.Lead>

      <GuideTypo.Section>Expected On</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          A start–end range, not a single day — it reflects the delivery window you
          expect rather than a firm date.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Edit it from the request&apos;s Basics card; the calendar updates to match.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        When a delivery date genuinely isn&apos;t known, the request&apos;s status can
        be set to <span className="font-mono">No ETA</span> rather than guessing a
        window.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ExpectedDates;
