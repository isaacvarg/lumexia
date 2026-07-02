import { GuideTypo } from "../../typography";

const Aliases = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An <span className="font-semibold">alias</span> is an alternate name or
        code for the same item. Suppliers, catalogues, and older records often
        refer to a material by a different name — aliases let all of those resolve
        back to one item.
      </GuideTypo.Lead>

      <GuideTypo.Section>How aliases work</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each alias has a <span className="font-semibold">name</span> and an{" "}
          <span className="font-semibold">alias type</span> describing what kind
          of alternate name it is (internal code, internal name, INCI
          nomenclature, product name, …).
        </GuideTypo.Item>
        <GuideTypo.Item>
          An alias can be tied to a specific{" "}
          <span className="font-semibold">supplier</span>, so that
          supplier&apos;s name for the material is recognized as referring to your
          item.
        </GuideTypo.Item>
        <GuideTypo.Item>
          When purchasing from that supplier, the purchase order displays the
          supplier&apos;s name while still retaining your internal name — handy for
          receiving deliveries and matching orders.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Aliases are created and managed from the Basics tab of the item&apos;s
        details page. The available alias types are configured under Inventory
        settings.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Aliases;
