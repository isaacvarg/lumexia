import { GuideTypo } from "../../../typography";

const Aliases = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Aliases</span> are the names or codes this
        supplier uses for your items — the ones that print on purchase orders sent to
        them.
      </GuideTypo.Lead>

      <GuideTypo.Section>Each row</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Shows the alias name, the item it maps to, the item&apos;s code, and the
          alias type, and links back to the inventory item.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Aliases are created on the <span className="font-semibold">item</span> itself,
        not here — this tab is the supplier-scoped view of them. When one exists, PO
        lines and the generated PDF read in the supplier&apos;s terms.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Aliases;
