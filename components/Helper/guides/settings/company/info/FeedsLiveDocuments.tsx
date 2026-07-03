import { GuideTypo } from "../../../../typography";

const FeedsLiveDocuments = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        These fields aren&apos;t just a record — they&apos;re the single source of
        truth read by document generators elsewhere in the app.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          The field keys are explicitly documented in code as the source that{" "}
          <span className="font-semibold">
            Purchase Order and Certificate of Analysis PDFs
          </span>{" "}
          read from — editing a value here changes what prints on those documents
          going forward.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Fields are stored as generic app <span className="font-mono">configs</span>{" "}
          (group <span className="font-mono">&apos;company&apos;</span>), the same
          key/value pattern used by other settings areas like the inventory audit
          triggers.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Saving is a single batched call across all fields on the tab, not a
          per-field save — nothing is written until you submit the form.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Because the keys are contractually read by the PDF generators, don&apos;t
        repurpose a field for something else even if the label seems generic — it
        will change a printed document.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default FeedsLiveDocuments;
