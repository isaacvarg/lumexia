import { GuideTypo } from "../../../typography";

const NewExperiment = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Use <span className="font-semibold">New experiment</span> to start an
        experiment with this item already filled in as the subject. It creates the
        experiment and takes you straight to it — no need to re-select the item.
      </GuideTypo.Lead>

      <GuideTypo.Section>Good to know</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          It seeds the <span className="font-semibold">subject only</span> — no
          variants are created; you build those inside the experiment.
        </GuideTypo.Item>
        <GuideTypo.Item>
          An experiment nests a hierarchy:{" "}
          <span className="font-mono">Experiment → Variant → Sample</span> (a
          candidate formula, then a physical batch of it).
        </GuideTypo.Item>
        <GuideTypo.Item>
          It opens at <span className="font-semibold">Planning</span> status with an
          auto-assigned reference code (
          <span className="font-mono">EXP-0001</span>). Status is descriptive, not a
          gate.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Sample measurements reuse the same QC parameters as the quality module —
          there are no separate definitions.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default NewExperiment;
