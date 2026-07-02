import { GuideTypo } from "../../typography";

const BrowsingItems = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The items list is where you browse every item. Each row summarizes an item
        and links straight to its details.
      </GuideTypo.Lead>

      <GuideTypo.Section>Columns</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Name">the item name.</GuideTypo.Item>
        <GuideTypo.Item term="Reference code">
          the item&apos;s unique reference code.
        </GuideTypo.Item>
        <GuideTypo.Item term="Item type">the item&apos;s category.</GuideTypo.Item>
        <GuideTypo.Item term="Aliases">
          the item&apos;s aliases, collapsed to a count when there are several.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Finding an item</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Filter the list to show only certain item types.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Use the global search to fuzzily match item name, aliases, and SKU.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Click any row to open that item&apos;s details.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default BrowsingItems;
