import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A request&apos;s detail page is everything about one request in one place —
        its status and priority, the live stock picture, the work that depends on it,
        and the purchase orders fulfilling it.
      </GuideTypo.Lead>

      <GuideTypo.Section>The cards</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Basics">
          who requested it, status, priority, supplier tags, and the Expected On
          window.
        </GuideTypo.Item>
        <GuideTypo.Item term="Notes">
          typed notes on the request.
        </GuideTypo.Item>
        <GuideTypo.Item term="Linked Batches & Linked POs">
          the production and purchase orders tied to this request.
        </GuideTypo.Item>
        <GuideTypo.Item term="Inventory">
          live stock plus the snapshot frozen at request time.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        See the <span className="font-semibold">Request cards</span> guide for what
        each card lets you do.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
