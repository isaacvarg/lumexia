import { GuideTypo } from "../../../typography";

const NotesFilesActivity = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        The other three tabs record the story around the order — context, paperwork, and
        who did what.
      </GuideTypo.Lead>

      <GuideTypo.Section>The tabs</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Notes">
          free-text notes, each with a note type and optional file attachments — a short
          payment, a disputed line, a delayed credit.
        </GuideTypo.Item>
        <GuideTypo.Item term="Files">
          digital copies of the paperwork (invoice, packing slip, BOL) — images and PDFs,
          stored with a thumbnail, opened via a short-lived link.
        </GuideTypo.Item>
        <GuideTypo.Item term="Activity">
          one timeline merging the accounting audit log with the purchasing-side
          activity, filterable by type and user.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        File typing is only partly wired today — the uploader stamps every file with a
        single default type, so per-file classification (Invoice / Packing Slip / BOL)
        isn&apos;t selectable at upload yet.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default NotesFilesActivity;
