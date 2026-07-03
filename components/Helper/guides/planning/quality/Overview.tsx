import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Quality tab shows the QC <span className="font-semibold">examinations</span>{" "}
        conducted against this batch.
      </GuideTypo.Lead>

      <GuideTypo.Section>What it&apos;s for</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          See the batch&apos;s quality results on its way from Awaiting QC to Released.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
