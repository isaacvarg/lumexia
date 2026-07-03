import { GuideTypo } from "../../../typography";

const Overview = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Planning is where <span className="font-semibold">batches</span> are
        requested and managed. A <span className="font-semibold">BPR</span> (Batch
        Production Record) is one concrete run of an item, made from its active MBPR
        at a chosen batch size.
      </GuideTypo.Lead>

      <GuideTypo.Section>The dashboard</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item term="Status">
          BPRs grouped by status, with a button per status showing a count.
        </GuideTypo.Item>
        <GuideTypo.Item term="Table">
          every BPR in one table, filterable by Item and Status.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        The header carries <span className="font-semibold">Request Batch</span> (start
        a new BPR) and <span className="font-semibold">Handle Completed BPRS</span>{" "}
        (process finished batches) — both covered in the guides here.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Overview;
