import { GuideTypo } from "../../../typography";

const VerdictsAndRuns = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        As you enter values on the Examination step, Lumexia evaluates each against
        the item&apos;s specification and shows a live verdict.
      </GuideTypo.Lead>

      <GuideTypo.Section>Live badges</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each value reports <span className="font-mono">PASS</span>,{" "}
          <span className="font-mono">FAIL</span>,{" "}
          <span className="font-mono">UNKNOWN</span>, or{" "}
          <span className="font-mono">no matching spec</span> as you type.
        </GuideTypo.Item>
        <GuideTypo.Item>
          A value that can&apos;t be compared to its spec (e.g. text against a numeric
          limit) is <span className="font-semibold">UNKNOWN</span>, not pass or fail.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Runs</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Record more than one <span className="font-semibold">Run</span> per parameter
          when a test is repeated — each keeps its own value and badge.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A <span className="font-semibold">Certificate of Analysis</span> is generated
        from the lot (lot details → <span className="font-semibold">Generate COA</span>),
        not here. It requires a <span className="font-semibold">Finished Product</span>{" "}
        examination to exist first, and includes only specs flagged{" "}
        <span className="font-semibold">Display on COA</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default VerdictsAndRuns;
