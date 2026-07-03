import { GuideTypo } from "../../../typography";

const DuplicateArchive = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Two order-wide actions live on the Options tab.
      </GuideTypo.Lead>

      <GuideTypo.Section>Duplicate</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Clones the order and <span className="font-semibold">all of its items</span>{" "}
          into a new <span className="font-semibold">Draft</span> — handy for repeat
          orders to the same supplier.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Archive</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Removes the order from the board after a confirmation. The board hides
          archived orders, but the record is kept — not deleted.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default DuplicateArchive;
