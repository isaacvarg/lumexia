import { GuideTypo } from "../../../typography";

const WorkInstructions = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Work instructions are the free-text, step-by-step directions attached to each
        step of the recipe.
      </GuideTypo.Lead>

      <GuideTypo.Section>Where they show up</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Here on the Instructions tab, in step order.
        </GuideTypo.Item>
        <GuideTypo.Item>
          To operators during <span className="font-semibold">compounding</span>, as
          each step is worked.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Instructions are authored per step in the wizard&apos;s{" "}
        <span className="font-semibold">Production</span> step — open{" "}
        <span className="font-semibold">Edit MBPR</span> to change them.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default WorkInstructions;
