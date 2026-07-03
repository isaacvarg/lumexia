import { GuideTypo } from "../../../typography";

const StartingAnExamination = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        An examination is always tied to a <span className="font-semibold">lot</span>.
        There are three ways to start one.
      </GuideTypo.Lead>

      <GuideTypo.Section>Ways in</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Select a lot">
          from search, recent batches, or purchases, then choose{" "}
          <span className="font-semibold">New</span>.
        </GuideTypo.Item>
        <GuideTypo.Item term="Scan">
          a lot&apos;s barcode to open a new examination for it directly.
        </GuideTypo.Item>
        <GuideTypo.Item term="Bulk Entry">
          record many results at once — a row per lot with its type and parameter
          values.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Bulk-entered examinations are recorded as{" "}
        <span className="font-semibold">passing</span>, and if a row&apos;s lot number
        doesn&apos;t exist yet Lumexia <span className="font-semibold">creates the
        lot</span> automatically — handy for importing historical results.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default StartingAnExamination;
