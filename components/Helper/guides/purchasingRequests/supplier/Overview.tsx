import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Supplier</span> tab regroups the same
        open requests by who you&apos;d buy from — handy for batching a call or PO to
        one vendor.
      </GuideTypo.Lead>

      <GuideTypo.Section>Getting around</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          <span className="font-semibold">All</span> shows every supplier group; each
          supplier button filters to just that vendor.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Requests with no supplier fall into an{" "}
          <span className="font-semibold">Untagged</span> group.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
