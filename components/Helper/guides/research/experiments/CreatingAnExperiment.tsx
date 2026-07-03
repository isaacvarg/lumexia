import { GuideTypo } from "../../../typography";

const CreatingAnExperiment = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Create Experiment</span> opens a form that
        frames the study — what you&apos;re researching and why.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it captures</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Subject">
          the inventory item being researched — it anchors cost projections and the
          item&apos;s own R&amp;D tab.
        </GuideTypo.Item>
        <GuideTypo.Item term="Objective">
          a short statement of what the study is trying to achieve.
        </GuideTypo.Item>
        <GuideTypo.Item term="Hypothesis">
          the expected outcome or the idea being tested.
        </GuideTypo.Item>
        <GuideTypo.Item term="Group">
          an optional experiment group to file it under.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A new experiment starts at <span className="font-semibold">Planning</span> with
        an automatic reference code. It can also be started with its subject pre-filled
        from an item&apos;s or an MBPR&apos;s R&amp;D tab — those seed the{" "}
        <span className="font-semibold">subject only</span>, not any variants.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default CreatingAnExperiment;
