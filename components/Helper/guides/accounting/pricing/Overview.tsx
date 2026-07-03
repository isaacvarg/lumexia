import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The pricing area runs <span className="font-semibold">pricing
        examinations</span> — audits that recompute what finished products should sell
        for so they clear a healthy profit margin.
      </GuideTypo.Lead>

      <GuideTypo.Section>The landing page</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Overview">
          two cards — the <span className="font-semibold">Queue</span> (waiting to be
          conducted) and <span className="font-semibold">Latest</span> (most recent).
        </GuideTypo.Item>
        <GuideTypo.Item term="All Examinations">
          every examination in one list.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        <span className="font-semibold">Configure Templates</span> sits at the top right;
        clicking a queued examination opens the conduct screen.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
