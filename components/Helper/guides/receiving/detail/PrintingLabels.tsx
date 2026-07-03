import { GuideTypo } from "../../../typography";

const PrintingLabels = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Once a line is received it moves to the{" "}
        <span className="font-semibold">Received</span> section, where you can print QR
        labels that tie the physical stock back to its lot.
      </GuideTypo.Lead>

      <GuideTypo.Section>Printing</GuideTypo.Section>
      <GuideTypo.Ordered>
        <GuideTypo.Step>Select one or more received items.</GuideTypo.Step>
        <GuideTypo.Step>Click the QR button to open the label form.</GuideTypo.Step>
        <GuideTypo.Step>
          Set <span className="font-semibold">Labels To Print</span> per item
          (defaults to 1).
        </GuideTypo.Step>
        <GuideTypo.Step>
          Click <span className="font-semibold">Print</span> — a PDF downloads with
          one <span className="font-mono">4 × 3 in</span> label per page.
        </GuideTypo.Step>
      </GuideTypo.Ordered>

      <GuideTypo.Section>What a label shows</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          The lot number, the item name, a QR code encoding the lot&apos;s unique id,
          and the generation timestamp.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The QR resolves to the <span className="font-semibold">lot</span>, not a
        container, so every label for a lot is interchangeable — print as many as the
        lot has packages. Reprint a single one anytime from the item&apos;s{" "}
        <span className="font-semibold">Lots</span> tab via{" "}
        <span className="font-semibold">Print Label</span>.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default PrintingLabels;
