import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The Basics tab is where the experiment&apos;s identity is edited — its status,
        group, objective, and hypothesis — with notes and files alongside.
      </GuideTypo.Lead>

      <GuideTypo.Section>On this tab</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The core fields, editable in place.
        </GuideTypo.Item>
        <GuideTypo.Item>
          <span className="font-semibold">Notes</span> and{" "}
          <span className="font-semibold">Files</span> panels for the experiment
          itself.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
