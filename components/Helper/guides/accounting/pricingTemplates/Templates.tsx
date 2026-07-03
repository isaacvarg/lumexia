import { GuideTypo } from "../../../typography";

const Templates = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Building out every finished-product container by hand for each examination is
        tedious — a template captures the recurring set once.
      </GuideTypo.Lead>

      <GuideTypo.Section>What a template carries</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each finished product&apos;s name, fill quantity, declared quantity,
          free-shipping cost, fill unit of measurement, a difficulty adjustment, and any
          auxiliaries (extras like caps or pumps).
        </GuideTypo.Item>
        <GuideTypo.Item>
          A template can be scoped to a specific item type or left generic so it applies
          to any item.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        While conducting an examination,{" "}
        <span className="font-semibold">Apply Template</span> instantiates the
        template&apos;s containers pre-filled with their cost structure, but with the
        pricing figures left at zero — so you only dial in the margin for each.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Templates;
