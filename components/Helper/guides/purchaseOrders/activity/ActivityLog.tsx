import { GuideTypo } from "../../../typography";

const ActivityLog = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Every change to the order is recorded here in order, giving you a complete
        history without leaving the page.
      </GuideTypo.Lead>

      <GuideTypo.Section>Filtering</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="By action">
          narrow to a kind of change — e.g. status advances or item edits.
        </GuideTypo.Item>
        <GuideTypo.Item term="By user">
          narrow to changes made by a specific person.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Because pipeline moves apply to the order and all its line items, a single
        advance can produce several related entries.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ActivityLog;
