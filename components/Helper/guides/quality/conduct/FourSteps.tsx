import { GuideTypo } from "../../../typography";

const FourSteps = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Conducting an examination moves through four steps, from the lot under test to
        an overall verdict.
      </GuideTypo.Lead>

      <GuideTypo.Ordered>
        <GuideTypo.Step>
          <span className="font-semibold">Lot</span> — the examination is always tied
          to a specific lot; pick it (or arrive here by scanning one).
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Type</span> —{" "}
          <span className="font-mono">Dry</span>,{" "}
          <span className="font-mono">In-Process</span>,{" "}
          <span className="font-mono">Finished Product</span>, or{" "}
          <span className="font-mono">Legacy Data</span>. The type determines which
          parameters appear (via their <span className="font-semibold">groups</span>)
          and which specifications apply.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Examination</span> — for each parameter,
          enter the measured value with its specification shown alongside. This view
          also holds <span className="font-semibold">Notes</span> and{" "}
          <span className="font-semibold">Attachments</span> tabs.
        </GuideTypo.Step>
        <GuideTypo.Step>
          <span className="font-semibold">Verdict</span> — set the overall outcome:{" "}
          <span className="font-semibold">Pass</span> or{" "}
          <span className="font-semibold">Out of Specification</span>.
        </GuideTypo.Step>
      </GuideTypo.Ordered>
    </GuideTypo.Wrapper>
  );
};

export default FourSteps;
