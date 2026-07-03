import { GuideTypo } from "../../../typography";

const CopyForLlm = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Copy for LLM</span> assembles an
        experiment&apos;s data into a single markdown document ready to paste into an
        external AI assistant.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it exports</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          A preamble framing the assistant as a cosmetic chemist, then the metadata,
          variant formulations and methods, samples, their measurements, and notes.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The button also appears at the <span className="font-semibold">variant</span>{" "}
          and <span className="font-semibold">sample</span> level, so you can share just
          one formulation or one sample.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Nothing is sent anywhere automatically — the content is simply copied to your
        clipboard for you to paste. It&apos;s a convenience for a second opinion on
        formulation, stability, or troubleshooting.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default CopyForLlm;
