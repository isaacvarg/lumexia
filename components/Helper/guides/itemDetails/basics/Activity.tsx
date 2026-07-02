import { GuideTypo } from "../../../typography";

const Activity = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Activity log is a change history for the item — an audit trail of what
        happened, when, and who did it.
      </GuideTypo.Lead>

      <GuideTypo.Section>Using it</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Filter by action to focus on one kind of change.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Filter by user to see one person&apos;s changes.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Automated changes are attributed to the Lumexia system user, so
        rule-driven activity is distinguishable from changes a person made.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Activity;
