import { GuideTypo } from "../../../typography";

const Reviewing = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Reviewing an examination means looking over the archived numbers and either
        accepting them or sending them back.
      </GuideTypo.Lead>

      <GuideTypo.Section>What you review</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Basics">
          the cost breakdown — overall item cost, arrival cost, production usage cost,
          auxiliary usage cost, unforeseen difficulties cost — plus who decided and when.
        </GuideTypo.Item>
        <GuideTypo.Item term="Notes">
          reviewer notes, each with a type and optional attachments.
        </GuideTypo.Item>
        <GuideTypo.Item term="Finished Products / Pricing Parameters">
          each container&apos;s archived pricing, and the BOM or container parameters
          behind the numbers.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        <span className="font-semibold">Rejecting re-queues automatically</span>: it marks
        the examination Rejected (recording who and when), creates a fresh{" "}
        <span className="font-semibold">Queued</span> examination for the same item linked
        to the one it replaced, and <span className="font-semibold">copies the reviewer
        notes forward</span> so the next person sees the feedback.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Reviewing;
