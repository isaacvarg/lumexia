import { GuideTypo } from "../../../../typography";

const DataTypeConfig = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Picking a Data Type reveals a different set of config fields — the
        actionable&apos;s validation and input widget are driven entirely by
        this choice.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item term="Numeric">
          <span className="font-mono">min</span>, <span className="font-mono">max</span>
          , <span className="font-mono">unit</span> (e.g. pH, °C, g), and{" "}
          <span className="font-mono">decimals</span> (default 2) — enforces a
          range check on entry.
        </GuideTypo.Item>
        <GuideTypo.Item term="Photo">
          <span className="font-mono">maxFiles</span> (default 5) and{" "}
          <span className="font-mono">accept</span> pattern (default{" "}
          <span className="font-mono">image/*</span>).
        </GuideTypo.Item>
        <GuideTypo.Item term="Text">
          <span className="font-mono">maxLength</span> (default 500) and a{" "}
          <span className="font-mono">placeholder</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Boolean">
          no extra config — a plain checkbox.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default DataTypeConfig;
