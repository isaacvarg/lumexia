import { GuideTypo } from "../../../typography";

const Steps = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        These are the batch&apos;s per-run steps — copied from the MBPR when the batch
        was requested, and worked on the compounding floor.
      </GuideTypo.Lead>

      <GuideTypo.Section>Good to know</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each step lists its actionables and the values operators enter during
          compounding.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The view here is read-only — steps are actually executed in{" "}
          <span className="font-semibold">Compounding</span>.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Steps;
