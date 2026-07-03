import { GuideTypo } from "../../../typography";

const VerifyingSteps = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Some step actionables are flagged to require verification. Until they&apos;re
        cleared, their step can&apos;t complete and the next step stays locked.
      </GuideTypo.Lead>

      <GuideTypo.Section>How it works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The flagged step opens with its completed actionables plus the step&apos;s
          equipment, materials, instructions, and addendums for context.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Approve each flagged actionable the same{" "}
          <span className="font-semibold">two-pass</span> way — primary, then
          independent secondary.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Once verification clears, the step can be completed and the following step
        unlocks.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default VerifyingSteps;
