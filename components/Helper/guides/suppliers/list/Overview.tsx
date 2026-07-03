import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">supplier</span> is a vendor you buy from.
        Every purchase order belongs to one supplier, and its record gathers a full
        history of what you&apos;ve bought from them.
      </GuideTypo.Lead>

      <GuideTypo.Section>The list</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Shows every active supplier, sorted by name, with search across the table.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Archived suppliers are excluded; click a supplier to open its detail page.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
