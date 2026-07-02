import { GuideTypo } from "../../../typography";

const DiscreteConversions = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A discrete conversion is a supplier-specific unit conversion. It eases the
        headache of a supplier selling an item in a different unit than the one you
        stock it in.
      </GuideTypo.Lead>

      <GuideTypo.Section>Example</GuideTypo.Section>
      <GuideTypo.Paragraph>
        Suppose a supplier sells an item by the case, but you keep quantity in
        units. Define a conversion — say{" "}
        <span className="font-mono">1 case = 25 units</span>. Order 2 cases from
        that supplier and, once the order clears receiving, 50 units are added to
        the item&apos;s stock automatically.
      </GuideTypo.Paragraph>

      <GuideTypo.Section>Good to know</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Scoped to one item <span className="font-semibold">and</span> one
          supplier — at most one conversion per item + supplier pair.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Only consulted when a unit is non-standard; two standard units use the
          global conversion instead.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Applied during the receiving workflow. If no conversion path exists,
          receiving halts and prompts you to add the missing factor.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Changing the item&apos;s inventory UOM clears its discrete conversions,
          since the resolved unit no longer applies.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default DiscreteConversions;
