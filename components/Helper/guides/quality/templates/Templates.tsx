import { GuideTypo } from "../../../typography";

const Templates = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">template</span> is a named, reusable set of
        parameters. Applying it to an item attaches all of its parameters at once.
      </GuideTypo.Lead>

      <GuideTypo.Section>Good for</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          &quot;The parameters we always test on this kind of item.&quot; Applying a
          template is done from the item&apos;s Quality tab.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Templates vs groups: a <span className="font-semibold">template</span> is a
        reusable bundle of parameters you attach to items; a{" "}
        <span className="font-semibold">group</span> controls which parameters appear
        for a given <span className="font-semibold">examination type</span> during an
        exam. Different jobs.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Templates;
