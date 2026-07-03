import { GuideTypo } from "../../../typography";

const Notes = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Notes let you keep typed context on the MBPR itself — decisions, history, or
        anything worth recording against the recipe.
      </GuideTypo.Lead>

      <GuideTypo.Section>Good to know</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each note has a <span className="font-semibold">type</span>; note types are
          maintained in configuration.
        </GuideTypo.Item>
        <GuideTypo.Item>
          These are distinct from a step&apos;s addendums and instructions, which live
          inside the recipe.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default Notes;
