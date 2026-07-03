import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The quality module does two things: it <span className="font-semibold">defines
        specifications</span> for each item, and it{" "}
        <span className="font-semibold">records examinations</span> against lots —
        checking results against those specs to decide pass or fail.
      </GuideTypo.Lead>

      <GuideTypo.Section>From here</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="New">start conducting an examination.</GuideTypo.Item>
        <GuideTypo.Item term="Examinations">
          browse every recorded examination.
        </GuideTypo.Item>
        <GuideTypo.Item term="Parameters">
          manage parameters, groups, and templates.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        You can also <span className="font-semibold">scan a lot</span> to open a new
        examination for it directly.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
