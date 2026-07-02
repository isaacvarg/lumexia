import { GuideTypo } from "../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Items are the foundation of inventory — every material, component, and
        product the system tracks starts here. These guides walk through what an
        item is made of and how to work with the items list.
      </GuideTypo.Lead>

      <GuideTypo.Section>In this section</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>The core properties every item carries.</GuideTypo.Item>
        <GuideTypo.Item>
          How procurement type shapes an item&apos;s workflows.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Aliases — alternate names and codes for the same item.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Browsing, filtering, and searching the items list.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Creating a new item and configuring the available options.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>Pick a guide above to dive in.</GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
