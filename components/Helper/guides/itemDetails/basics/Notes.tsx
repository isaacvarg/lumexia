import { GuideTypo } from "../../../typography";

const Notes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Notes let you attach timestamped commentary to an item — context, history,
        or reminders that live alongside the record.
      </GuideTypo.Lead>

      <GuideTypo.Section>Good to know</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each note is stamped with its author and time when added.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Notes are categorized by{" "}
          <span className="font-semibold">note type</span>, so they can be
          organized and filtered.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Notes aren&apos;t unique to items — other records the item touches, such
          as purchase orders and individual lots, carry their own notes (lots even
          have their own separate note types).
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Notes;
