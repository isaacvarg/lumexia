import { GuideTypo } from "../../../typography";

const Examinations = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        These are the quality examinations recorded against the batch&apos;s lot — the
        testing that gates it from <span className="font-semibold">Awaiting QC</span>{" "}
        to <span className="font-semibold">Released</span>.
      </GuideTypo.Lead>

      <GuideTypo.Note>
        This is the top-level <span className="font-semibold">Quality/QC</span> testing
        of the finished batch — distinct from the{" "}
        <span className="font-semibold">Production Quality</span> verification of
        staged materials and steps that happens during compounding.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Examinations;
