import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Production Settings → Equipment</span> is
        the base catalog of physical equipment — the record everything else
        (compounding vessels) decorates.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item term="Equipment Name">
          the display name.
        </GuideTypo.Item>
        <GuideTypo.Item term="Identifier">
          a short tag/code, shown alongside the name in tables and vessel cards.
        </GuideTypo.Item>
        <GuideTypo.Item term="Type">
          which Equipment Type it belongs to; filterable in the table.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Saving equipment reloads the page (a hard refresh, not a soft
        client-side update) — expect a brief flash after Add/Edit.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
