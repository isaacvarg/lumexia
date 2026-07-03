import { GuideTypo } from "../../../typography";

const Contacts = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Contacts</span> are the people you deal with
        at the supplier, each kept as their own record.
      </GuideTypo.Lead>

      <GuideTypo.Section>Each contact</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Has a name and an optional role, phone, and email.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Selecting one opens their detail and a dedicated{" "}
          <span className="font-semibold">notes</span> section — a running record of
          conversations with that specific person.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Contact notes are separate from the supplier-level Notes tab, so per-person
        history doesn&apos;t get mixed into general supplier notes.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Contacts;
