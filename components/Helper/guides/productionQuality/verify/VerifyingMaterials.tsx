import { GuideTypo } from "../../../typography";

const VerifyingMaterials = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Open a queued batch to see its material lines awaiting each pass, then clear
        them one at a time.
      </GuideTypo.Lead>

      <GuideTypo.Section>On a material line</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Review the individual <span className="font-semibold">staged pulls</span> —
          lot, quantity, and any photo.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Check the <span className="font-semibold">weighed vs expected</span>{" "}
          quantities.
        </GuideTypo.Item>
        <GuideTypo.Item>
          <span className="font-semibold">Verify</span> to clear it, or{" "}
          <span className="font-semibold">deny</span> — a denial records a note and
          sends it back.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Primary and secondary are <span className="font-semibold">independent</span>{" "}
        passes by different roles; a line isn&apos;t cleared until every pull has passed
        secondary verification.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default VerifyingMaterials;
