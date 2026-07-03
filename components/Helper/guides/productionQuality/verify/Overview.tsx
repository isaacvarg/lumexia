import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Verifying is the act of clearing a batch&apos;s work — approving what was
        staged or flagged, or denying it back for a fix.
      </GuideTypo.Lead>

      <GuideTypo.Section>What you check</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Staged <span className="font-semibold">materials</span> — the weighed pulls,
          their lots, and photos.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Flagged <span className="font-semibold">step actionables</span> that require
          verification before their step can complete.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
