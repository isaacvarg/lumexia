import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        R&amp;D is where a formulation is developed before it becomes a production
        recipe. An <span className="font-semibold">experiment</span> studies one
        subject item — you draft candidate formulas, make samples, measure them, and
        project their cost.
      </GuideTypo.Lead>

      <GuideTypo.Section>The record hierarchy</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Experiment">
          the study — its subject, investigator, objective, and hypothesis.
        </GuideTypo.Item>
        <GuideTypo.Item term="Variant">
          one candidate formulation inside an experiment.
        </GuideTypo.Item>
        <GuideTypo.Item term="Sample">
          a physical batch actually made from a variant.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The list shows one row per experiment — Reference (
        <span className="font-mono">EXP-0001</span>), Objective, Status, Investigator,
        Subject, Group, and Created. Click a row to open it.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
