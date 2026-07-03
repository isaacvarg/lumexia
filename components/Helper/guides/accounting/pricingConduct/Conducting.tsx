import { GuideTypo } from "../../../typography";

const Conducting = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        How an examination is conducted depends on how the item is sourced — the building
        block in both cases is the item&apos;s cost.
      </GuideTypo.Lead>

      <GuideTypo.Section>By source</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Purchased">
          priced from its pricing data and most recent purchase price, converted to a{" "}
          <span className="font-semibold">cost per pound</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Produced">
          priced from the active MBPR&apos;s bill of materials, rolled up into cost per
          batch and per pound.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        An item&apos;s cost is{" "}
        <span className="font-mono">
          price per unit + arrival cost + unforeseen difficulties
        </span>
        , where <span className="font-semibold">price per unit</span> is the{" "}
        <span className="font-semibold">upcoming price</span> when one is set and active,
        otherwise the <span className="font-semibold">last purchase price</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Conducting;
