import { GuideTypo } from "../../../typography";

const FormulationAndMethod = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A variant has two parts: the <span className="font-semibold">formulation</span>{" "}
        (materials and how much of each) and the{" "}
        <span className="font-semibold">method</span> (the ordered steps to make it).
      </GuideTypo.Lead>

      <GuideTypo.Section>Formulation</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each line is an inventory item plus a{" "}
          <span className="font-semibold">concentration (% w/w)</span>; a running{" "}
          <span className="font-semibold">total</span> shows whether the formula sums
          to 100%.
        </GuideTypo.Item>
        <GuideTypo.Item term="Phases">
          free-text groupings (Water phase, Oil phase, Cool down) that organize the
          materials; per-variant, and you can reorder within and across them by drag.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Method</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          An ordered list of numbered steps, each with an optional phase label and
          free-text content. The formulation says what goes in; the method says how.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Concentrations are stored internally as fractions between{" "}
        <span className="font-mono">0</span> and <span className="font-mono">1</span>{" "}
        but are always shown and entered as percentages —{" "}
        <span className="font-mono">0.05</span> displays as{" "}
        <span className="font-mono">5%</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default FormulationAndMethod;
