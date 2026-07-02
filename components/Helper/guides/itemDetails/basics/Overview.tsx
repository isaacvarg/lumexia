import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The item details page is the hub for everything about a single item.
        It&apos;s organized into tabs, with a few key actions always available in
        the title row at the top.
      </GuideTypo.Lead>

      <GuideTypo.Section>Every tab has its own guides</GuideTypo.Section>
      <GuideTypo.Paragraph>
        This Helper updates as you move between tabs — click a tab (Inventory,
        Pricing, Production, and so on) and the guides here change to explain that
        tab. What you&apos;re reading now covers the page as a whole and the{" "}
        <span className="font-semibold">Basics</span> tab.
      </GuideTypo.Paragraph>

      <GuideTypo.Section>Title row actions</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Investigate">
          open a focused investigation view for the item.
        </GuideTypo.Item>
        <GuideTypo.Item term="Inventory Audit">
          start a physical count to reconcile recorded stock against what&apos;s on
          the shelf.
        </GuideTypo.Item>
        <GuideTypo.Item term="Request Purchase">
          raise a purchasing request with the item pre-selected.
        </GuideTypo.Item>
      </GuideTypo.List>
      <GuideTypo.Note>
        Which tabs appear depends on the item&apos;s procurement type — purchased
        items show a Purchasing tab; produced items do not.
      </GuideTypo.Note>

      <GuideTypo.Section>The Basics tab</GuideTypo.Section>
      <GuideTypo.Paragraph>
        Basics holds the item&apos;s identity and history: its core properties,
        aliases, notes, and a full activity log. Use the guides above to dig into
        each.
      </GuideTypo.Paragraph>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
