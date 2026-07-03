import { GuideTypo } from "../../../../typography";

const SingletonConfig = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        There&apos;s exactly one overhead row in the whole system — this form
        always edits that same record.
      </GuideTypo.Lead>

      <GuideTypo.List>
        <GuideTypo.Item>
          Saving updates the existing config if one exists, or creates it on
          first save — either way, the app behaves as if there&apos;s a single
          global setting.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Because it&apos;s global, it can&apos;t model a per-product or
          per-material overhead difference — everything gets the same
          percentage and per-lb add-on.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default SingletonConfig;
