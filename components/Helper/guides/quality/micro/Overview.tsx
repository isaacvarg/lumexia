import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Micro</span> handles microbiological testing,
        which is typically sent out to a lab rather than measured in-house.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it does</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Instead of recording results, it generates a{" "}
          <span className="font-semibold">Sample Submission Form (SSF)</span> — the
          paperwork that travels with the physical samples.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
