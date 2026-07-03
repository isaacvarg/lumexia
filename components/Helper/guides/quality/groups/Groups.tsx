import { GuideTypo } from "../../../typography";

const Groups = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">group</span> is a set of parameters bound to
        an <span className="font-semibold">examination type</span> — it decides which
        parameters appear for that type of exam.
      </GuideTypo.Lead>

      <GuideTypo.Section>What a group carries</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>A name and an abbreviation.</GuideTypo.Item>
        <GuideTypo.Item>
          The <span className="font-semibold">examination type</span> it belongs to
          (Dry, In-Process, Finished Product, Legacy Data).
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Membership is managed from either side — add a parameter to a group, or add
        parameters to a group from its own detail page.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Groups;
