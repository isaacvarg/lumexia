import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Basics tab is the batch&apos;s control center — its size, its status, its
        schedule, and whether there&apos;s enough material to make it.
      </GuideTypo.Lead>

      <GuideTypo.Section>Three cards + the BOM</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Batch Size">
          the size this run was requested at.
        </GuideTypo.Item>
        <GuideTypo.Item term="Status">
          the current status; opens a <span className="font-semibold">Change Status
          To…</span> dialog for manual changes.
        </GuideTypo.Item>
        <GuideTypo.Item term="Scheduling">
          sets the scheduled date range — a batch can&apos;t be opened on the
          compounding floor until it has one.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Below the cards, the <span className="font-semibold">Bill of Materials</span>{" "}
        sufficiency table shows whether every material is in stock — see the guides.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
