import { GuideTypo } from "../../typography";

const PropertyConfiguration = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Several of the options you pick when working with items are configurable.
        You can add, edit, or remove them so the choices match how your facility
        operates.
      </GuideTypo.Lead>

      <GuideTypo.Section>What can be configured</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Item types">
          the categories an item can belong to, including their own settings.
        </GuideTypo.Item>
        <GuideTypo.Item term="Alias types">
          the kinds of alternate names an item can have.
        </GuideTypo.Item>
        <GuideTypo.Item term="File types">
          the categories used when attaching documents to an item.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        These are managed from the Inventory settings page under its configuration
        tab.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default PropertyConfiguration;
