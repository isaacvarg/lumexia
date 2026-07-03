import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Status</span> tab groups every open
        request by its stage in the pipeline, so you can see what&apos;s waiting on
        pricing, sitting in a PO, or stuck.
      </GuideTypo.Lead>

      <GuideTypo.Section>Getting around</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          <span className="font-semibold">All</span> shows every request grouped by
          status; each status button filters to just that stage, with a count.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The search bar filters by item name or supplier across the whole board.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
