import { GuideTypo } from "../../../typography";

const VerificationWorkflow = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Every check is done <span className="font-semibold">twice, by two different
        roles</span>, so no single person both stages a material and clears it.
      </GuideTypo.Lead>

      <GuideTypo.Section>Two passes</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          A staged material advances{" "}
          <span className="font-mono">
            Staged → Primary Verified → Secondary Verified
          </span>{" "}
          — primary by the <span className="font-semibold">Production Quality</span>{" "}
          role, secondary by <span className="font-semibold">Production Quality
          Secondary</span>.
        </GuideTypo.Item>
        <GuideTypo.Item>
          A material line is fully cleared only once{" "}
          <span className="font-semibold">every</span> staged pull for it has been
          secondary verified.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Verification gates the batch in three places: (1) a batch can&apos;t leave{" "}
        <span className="font-semibold">Staging Materials</span> for Compounding until{" "}
        <span className="font-semibold">every</span> material is secondary verified;
        (2) a step is <span className="font-semibold">locked</span> while the previous
        step has verification-required actionables not yet verified; (3) a material can
        be checked off on a step only once it&apos;s secondary verified.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default VerificationWorkflow;
