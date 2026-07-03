import { GuideTypo } from "../../../../typography";

const WhereTheyShowUp = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        One definitions table, four different places it renders — changing an
        Actionable Type here affects all of them at once.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          The <span className="font-semibold">MBPR wizard</span> (step 3) — where
          actionables are attached to a step while authoring a master BPR.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The <span className="font-semibold">BPR compounding step</span> —
          actionables listed alongside step actions on a live batch.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The <span className="font-semibold">live compounding execution</span>{" "}
          flow — where an operator actually fills in the value (checks a box,
          enters a number, uploads a photo, types text).
        </GuideTypo.Item>
        <GuideTypo.Item>
          The <span className="font-semibold">production quality step</span>{" "}
          review — the same actionable, shown completed for QA sign-off.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The User Role field gates who&apos;s expected to complete the
        actionable, not who can view it — it&apos;s a responsibility label read
        by the compounding/quality UI, not a hard permission check.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default WhereTheyShowUp;
