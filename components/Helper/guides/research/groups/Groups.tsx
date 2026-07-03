import { GuideTypo } from "../../../typography";

const Groups = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An <span className="font-semibold">experiment group</span> ties related
        experiments together — for example a series of studies on one product line or
        one problem.
      </GuideTypo.Lead>

      <GuideTypo.Section>How they work</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each group lists its experiments nested underneath.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Groups carry their <span className="font-semibold">own status</span>, so a
          whole line of work can be marked active, completed, and so on.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Membership is <span className="font-semibold">optional</span> — set it when
          the experiment is created or later on its Basics tab.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Groups;
