import { GuideTypo } from "../../../typography";

const AggregatedFiles = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Files can be attached to the experiment and to individual samples; this tab
        gathers them all into one list.
      </GuideTypo.Lead>

      <GuideTypo.Section>What you see</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Experiment-level and sample-level documents and images together, so nothing
          is buried inside a single sample.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default AggregatedFiles;
