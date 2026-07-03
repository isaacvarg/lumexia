import { GuideTypo } from "../../../typography";

const Notes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The <span className="font-semibold">Notes</span> tab holds general notes about
        the supplier as a whole — kept separately from contact notes.
      </GuideTypo.Lead>

      <GuideTypo.Section>Good to know</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each note shows its created and updated times and can be edited or deleted.
        </GuideTypo.Item>
        <GuideTypo.Item>
          These are distinct from the per-contact notes on the Contacts tab and from
          the visibility-scoped notes on a purchase order.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Notes;
