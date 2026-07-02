import { GuideTypo } from "../../typography";

const CreatingAnItem = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Items are the building blocks of inventory. Creating one registers a new
        material, component, or product that the rest of the system can track,
        purchase, and produce.
      </GuideTypo.Lead>

      <GuideTypo.Section>Steps</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>
          On the items list, select{" "}
          <span className="font-semibold">Create Item</span>.
        </GuideTypo.Step>
        <GuideTypo.Step>Fill in the core properties in the dialog:</GuideTypo.Step>
      </GuideTypo.Ordered>
      <div className="pl-8">
        <GuideTypo.List>
          <GuideTypo.Item>Name</GuideTypo.Item>
          <GuideTypo.Item>Reference code</GuideTypo.Item>
          <GuideTypo.Item>Item type</GuideTypo.Item>
          <GuideTypo.Item>Inventory type</GuideTypo.Item>
          <GuideTypo.Item>Procurement type</GuideTypo.Item>
          <GuideTypo.Item>Inventory unit of measurement</GuideTypo.Item>
        </GuideTypo.List>
      </div>

      <GuideTypo.Note>
        Once created, the item opens to its details page, where you can add
        aliases, record stock, attach files, and configure the rest of its
        behavior.
      </GuideTypo.Note>

      <GuideTypo.Section>Tips</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Use consistent naming so items are easy to search.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Set up aliases for materials that go by more than one name.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default CreatingAnItem;
