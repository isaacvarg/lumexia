import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The details screen is where a completed examination is reviewed — a read-only
        snapshot with the decision buttons.
      </GuideTypo.Lead>

      <GuideTypo.Section>What&apos;s shown</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Basics (the cost breakdown), Notes, and tabs for Finished Products and Pricing
          Parameters.
        </GuideTypo.Item>
        <GuideTypo.Item>
          <span className="font-semibold">Approve</span> and{" "}
          <span className="font-semibold">Reject</span> appear only while the examination
          is <span className="font-semibold">Pending Review</span>.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
