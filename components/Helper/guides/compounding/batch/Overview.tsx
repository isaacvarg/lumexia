import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Opening a batch shows the right view for its status — the one thing you can do
        next.
      </GuideTypo.Lead>

      <GuideTypo.Section>By status</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Queued">
          offers <span className="font-semibold">Begin Staging</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Staging Materials">
          splits the materials into <span className="font-semibold">Not Started</span>{" "}
          and <span className="font-semibold">Staged</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Compounding">
          opens the ordered steps.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
