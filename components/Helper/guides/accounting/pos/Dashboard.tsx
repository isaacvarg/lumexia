import { GuideTypo } from "../../../typography";

const Dashboard = () => {
  return (
    <GuideTypo.Wrapper>
      <GuideTypo.Lead>
        Accounting attaches a <span className="font-semibold">single record</span> to a
        purchasing-owned PO that holds everything reviewed here.
      </GuideTypo.Lead>

      <GuideTypo.Section>What the record holds</GuideTypo.Section>
      <GuideTypo.List>
        <GuideTypo.Item>
          Its accounting status, the payment method, and three yes/no states:{" "}
          <span className="font-semibold">Paid</span>,{" "}
          <span className="font-semibold">Packing Slip</span> received, and{" "}
          <span className="font-semibold">Invoice</span> handed off.
        </GuideTypo.Item>
        <GuideTypo.Item>
          The dashboard&apos;s Paid / Packing Slip / Invoice columns are those three
          states.
        </GuideTypo.Item>
      </GuideTypo.List>

      <GuideTypo.Note>
        A PO that accounting hasn&apos;t touched yet shows grey{" "}
        <span className="font-semibold">No Data</span> tags — click it to start its
        record. The accounting status (Not Started, In Progress, Completed…) is{" "}
        <span className="font-semibold">configurable data</span>, each with its own tag
        color.
      </GuideTypo.Note>
    </GuideTypo.Wrapper>
  );
};

export default Dashboard;
