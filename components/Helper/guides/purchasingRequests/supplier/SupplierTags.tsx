import { GuideTypo } from "../../../typography";

const SupplierTags = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Supplier tags are what this tab groups on. They&apos;re set on a
        request&apos;s <span className="font-semibold">Basics</span> card, and a
        single request can carry <span className="font-semibold">more than one</span>{" "}
        supplier tag.
      </GuideTypo.Lead>

      <GuideTypo.Section>How grouping works</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Each tagged supplier gets its own group of requests; the search bar still
          filters by item name or supplier within the view.
        </GuideTypo.Item>
        <GuideTypo.Item term="Untagged">
          requests with no supplier tag are collected here — a good worklist for
          deciding who to source from.
        </GuideTypo.Item>
        <GuideTypo.Item>
          Because a request can hold several tags, it can appear under more than one
          supplier group.
        </GuideTypo.Item>
      </GuideTypo.List>
    </GuideTypo.Wrapper>
  );
};

export default SupplierTags;
