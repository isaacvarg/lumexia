import { GuideTypo } from "../../../typography";

const Versions = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        A version is one complete set of instructions, materials, batch sizes, and
        parameters. An item can carry several, each with its own label and estimated
        total time.
      </GuideTypo.Lead>

      <GuideTypo.Section>Starting a version</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Add New">
          starts a blank version with a label and an estimated total time.
        </GuideTypo.Item>
        <GuideTypo.Item term="Copy">
          deep-clones an existing version — its steps, materials, instructions,
          addendums, actionables, and batch sizes — labeled{" "}
          <span className="font-mono">Copy of …</span> for you to rename. Far faster
          than rebuilding a similar recipe.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        Only <span className="font-semibold">one</span> version should be{" "}
        <span className="font-semibold">active</span> for an item at a time — made
        active by setting its <span className="font-semibold">Status</span> to Active.
        Keeping a single active version avoids ambiguity for planning, pricing, and
        trends.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Versions;
