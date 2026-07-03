import { GuideTypo } from "../../../typography";

const Parameters = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A <span className="font-semibold">parameter</span> is a measurable
        characteristic of an item. Create one with{" "}
        <span className="font-semibold">New Parameter</span>.
      </GuideTypo.Lead>

      <GuideTypo.Section>What a parameter carries</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Name">what is being measured (e.g. pH).</GuideTypo.Item>
        <GuideTypo.Item term="Data type">
          <span className="font-mono">Number</span> (decimal),{" "}
          <span className="font-mono">Integer</span> (whole),{" "}
          <span className="font-mono">Text</span> (free-text), or{" "}
          <span className="font-mono">Boolean</span> (shown as Pass/Fail).
        </GuideTypo.Item>
        <GuideTypo.Item term="Unit of measurement">
          a free-text label shown next to the value.
        </GuideTypo.Item>
        <GuideTypo.Item term="Is Wet Parameter">
          flags wet-chemistry parameters.
        </GuideTypo.Item>
        <GuideTypo.Item term="Input definitions">
          optional extra sub-inputs captured alongside the reading (temperature,
          wavelength) — each with a name, label, data type, optional unit, and
          Required flag; specs can be pinned to them.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Quality values are stored free-form and are deliberately{" "}
        <span className="font-semibold">not</span> run through unit conversions — the
        unit is just a label.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Parameters;
