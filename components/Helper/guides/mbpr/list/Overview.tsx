import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An <span className="font-semibold">MBPR</span> is the master recipe for
        producing one item. This list is every master record you&apos;ve authored —
        one row per record.
      </GuideTypo.Lead>

      <GuideTypo.Section>The table</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Produced Item">the item the MBPR makes.</GuideTypo.Item>
        <GuideTypo.Item term="Version Label">
          the version&apos;s label — an item can have several versions.
        </GuideTypo.Item>
        <GuideTypo.Item term="Status">
          Active (green) or archived (red); only active records show by default.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Filter by Item, Version, and Status. Above the table,{" "}
        <span className="font-semibold">Create or Modify MBPR</span> opens the wizard,
        and <span className="font-semibold">Configure</span> manages the shared
        equipment, vessels, and actionable types every MBPR draws on.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
