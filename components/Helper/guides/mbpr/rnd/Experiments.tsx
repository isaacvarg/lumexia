import { GuideTypo } from "../../../typography";

const Experiments = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        This tab links the recipe to the research that spun off from it, so you can
        trace which experiments started from this MBPR version.
      </GuideTypo.Lead>

      <GuideTypo.Section>How the link forms</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          When a research variant is created as an{" "}
          <span className="font-semibold">analog</span> of an MBPR, it records which
          version it came from.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Every experiment with such a variant is listed here.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        <span className="font-semibold">New experiment</span> starts an experiment
        with this MBPR&apos;s produced item filled in as the subject — it seeds the{" "}
        <span className="font-semibold">subject only</span>, and does not create the
        variant.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Experiments;
