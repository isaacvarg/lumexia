import { GuideTypo } from "../../../typography";

const AggregatedNotes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Notes can be attached to the experiment (on Basics) and to individual samples;
        this tab rolls both into one feed.
      </GuideTypo.Lead>

      <GuideTypo.Section>What you see</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Experiment notes and sample notes side by side, each labeled with where it
          came from.
        </GuideTypo.Item>
        <GuideTypo.Item>
          They share the same color-coded <span className="font-semibold">note
          types</span> used everywhere in the experiment.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default AggregatedNotes;
