import { GuideTypo } from "../../../typography";

const UploadingFiles = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Upload one or more files, assign a file type, and apply tags so documents
        stay organized and findable.
      </GuideTypo.Lead>

      <GuideTypo.Section>How it works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="File type">
          the category a document belongs to. File types are managed in the item
          property configuration under Inventory settings.
        </GuideTypo.Item>
        <GuideTypo.Item term="Tags">
          custom labels with their own colors, created and assigned at upload, used
          to filter and find documents later.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Some documents arrive automatically — a generated certificate of analysis
        is saved back to the item&apos;s files as a regulatory record.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default UploadingFiles;
