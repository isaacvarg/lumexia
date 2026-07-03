import { GuideTypo } from "../../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        <span className="font-semibold">Company Settings → Images</span> holds
        three fixed image slots — each one drives a specific generated document
        elsewhere in the app, not just a profile picture.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item term="Company Logo">
          shown on Purchase Order and Certificate of Analysis printouts.
        </GuideTypo.Item>
        <GuideTypo.Item term="Micro Submission Form Template">
          the full-page background image used when generating the Micro Submission
          Form.
        </GuideTypo.Item>
        <GuideTypo.Item term="Signature">
          stamped onto the Micro Submission Form when a signature is included.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Each slot is exactly one image at a time — uploading a new one replaces
        what&apos;s there, it doesn&apos;t version or archive the old one.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
