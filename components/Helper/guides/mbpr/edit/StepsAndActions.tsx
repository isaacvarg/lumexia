import { GuideTypo } from "../../../typography";

const StepsAndActions = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The recipe is built as an ordered list of <span className="font-semibold">
        steps</span>. Each has a sequence, a <span className="font-semibold">label</span>,
        and a <span className="font-semibold">phase</span> (a free-text grouping like
        &quot;Heating&quot;); steps display grouped by phase.
      </GuideTypo.Lead>

      <GuideTypo.Section>What a step contains</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Materials">
          bill-of-materials lines — an inventory item plus a{" "}
          <span className="font-mono">concentration (% w/w)</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Work Instructions">
          free-text directions shown here and to operators during compounding.
        </GuideTypo.Item>
        <GuideTypo.Item term="Addendums">
          typed, color-coded supplemental notes or warnings.
        </GuideTypo.Item>
        <GuideTypo.Item term="Actionables">
          the tasks an operator must complete — each with a type and three flags:{" "}
          <span className="font-semibold">Required</span>,{" "}
          <span className="font-semibold">Verification Required</span>, and{" "}
          <span className="font-semibold">Secondary Verification Required</span>, and
          assigned to a <span className="font-semibold">role</span> so only that role
          acts on it.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Actionable types</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          <span className="font-mono">Boolean</span> (a yes/no check),{" "}
          <span className="font-mono">Numeric</span> (a number, optionally with a unit
          and min/max), <span className="font-mono">Photo</span> (evidence), and{" "}
          <span className="font-mono">Text</span> (a short note).
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Every step must end with a <span className="font-semibold">Complete Step</span>{" "}
        actionable. Until a step has one you{" "}
        <span className="font-semibold">cannot add the next step</span> — a warning
        lists the steps that are missing it.
      </GuideTypo.Note>

      <GuideTypo.Note>
        The step <span className="font-semibold">Equipment</span> section is a work in
        progress and shows &quot;WIP&quot; in the wizard; equipment is otherwise
        managed on the <span className="font-semibold">Configure</span> page.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default StepsAndActions;
