import { GuideTypo } from "../../../../typography";

const UploadMechanics = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Each slot uploads independently — there&apos;s no batch save across all
        three like the Info tab.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Picking a new file for a slot uploads it immediately and swaps the
          preview in place; there&apos;s no separate confirm step per slot.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The Micro Submission Form template and signature only matter if your
          workflow actually generates that form — if you don&apos;t use micro
          submission, these two slots can be left empty without affecting
          anything else.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default UploadMechanics;
