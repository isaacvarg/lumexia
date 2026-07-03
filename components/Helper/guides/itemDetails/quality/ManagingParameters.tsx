import { GuideTypo } from "../../../typography";

const ManagingParameters = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The parameters, groups, and templates this item uses aren&apos;t defined
        here — they&apos;re the reusable quality vocabulary managed at{" "}
        <span className="font-mono">/quality/qc/parameters</span>. This tab only
        attaches them and sets the item&apos;s own passing values.
      </GuideTypo.Lead>

      <GuideTypo.Section>Creating a parameter</GuideTypo.Section>
      <GuideTypo.Paragraph>
        Use <span className="font-semibold">New Parameter</span>. A parameter
        carries:
      </GuideTypo.Paragraph>
      <GuideTypo.List>
        <GuideTypo.Item term="Name & description">
          the reusable characteristic (pH, assay).
        </GuideTypo.Item>
        <GuideTypo.Item term="Unit of measurement">
          a free-text label only — quality values are deliberately{" "}
          <span className="font-semibold">not</span> run through unit conversions.
        </GuideTypo.Item>
        <GuideTypo.Item term="Data type">
          one of <span className="font-mono">Number</span> (decimal),{" "}
          <span className="font-mono">Integer</span> (whole),{" "}
          <span className="font-mono">Text</span> (free-text), or{" "}
          <span className="font-mono">Boolean</span> (shown as Pass/Fail).
        </GuideTypo.Item>
        <GuideTypo.Item term="Is Wet Parameter">
          flags parameters measured on wet (vs dried) material.
        </GuideTypo.Item>
      </GuideTypo.List>
      <GuideTypo.Paragraph>
        After creation, the parameter&apos;s own page manages its{" "}
        <span className="font-semibold">Basics</span>,{" "}
        <span className="font-semibold">Groups</span>,{" "}
        <span className="font-semibold">Templates</span>, and{" "}
        <span className="font-semibold">Input Definitions</span>.
      </GuideTypo.Paragraph>

      <GuideTypo.Section>Groups vs templates</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Template">
          a named, reusable <em>set of parameters</em>. Applying a template to an
          item (from this Quality tab) attaches all of its parameters at once.
        </GuideTypo.Item>
        <GuideTypo.Item term="Group">
          a set of parameters tied to an{" "}
          <span className="font-semibold">examination type</span>; it controls{" "}
          <em>which parameters appear</em> for that exam type when an examination
          is recorded.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Section>Input definitions</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Extra sub-inputs captured alongside the main reading — e.g. the
          temperature or wavelength a value was taken at.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Each has a name, label, data type, optional unit, and a{" "}
          <span className="font-semibold">Required</span> flag.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A specification on this tab can be <span className="font-semibold">pinned</span>{" "}
        to specific input-definition values (its Conditions), so the same parameter
        can hold different limits depending on how the reading was taken.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default ManagingParameters;
