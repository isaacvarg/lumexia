import { qualityActions } from "@/actions/quality";
import PageBreadcrumbs from "@/components/App/PageBreadcrumbs";
import Card from "@/components/Card";
import PageTitle from "@/components/Text/PageTitle";
import ExamsTable from "./_components/ExamsTable";
import HelperSetter from "@/components/Helper/HelperSetter";

const ExaminationPage = async () => {

  const exams = await qualityActions.qc.records.getAll();

  return (
    <div className='flex flex-col gap-y-6'>
      <HelperSetter section="qc-examinations" />
      <div>
        <PageTitle>Examinations</PageTitle>
      </div>

      <Card.Root>


        <ExamsTable exams={exams} />
      </Card.Root>



    </div>
  )
}

export default ExaminationPage; 
