import { GuideTypo } from "../../../typography";

const Measurements = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Once a sample exists you can record <span className="font-semibold">QC
        measurements</span> against it — tying it to a quality parameter and storing the
        measured value.
      </GuideTypo.Lead>

      <GuideTypo.Section>What makes them flexible</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Runs">
          the same parameter can be measured more than once — each reading is a numbered
          run, so you can record a value at 24h, 48h, and keep them all.
        </GuideTypo.Item>
        <GuideTypo.Item term="Structured inputs">
          parameters with multiple input definitions capture each field on the
          measurement, not just a single number.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        R&amp;D uses the same <span className="font-semibold">QC parameters</span> as
        production quality control, so a reading taken on the bench is described in
        exactly the same terms as one taken on a released batch.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Measurements;
