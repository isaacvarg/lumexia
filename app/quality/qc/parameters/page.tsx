import { qualityActions } from "@/actions/quality"
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import StateSetter from "./_components/state/StateSetter";
import QcParametersHelper from "./_components/shared/QcParametersHelper";

const ParametersPage = async () => {

  const parameters = await qualityActions.qc.parameters.getAll();
  const templates = await qualityActions.qc.templates.getAll();
  const groups = await qualityActions.qc.groups.getAll();
  const examinationTypes = await qualityActions.qc.examinationTypes.getAll();


  return (
    <div className='flex flex-col gap-y-6'>

      <StateSetter
        parameters={parameters}
        templates={templates}
        groups={groups}
        examinationTypes={examinationTypes}
      />

      <QcParametersHelper />

      <TabSelector />
      <TabsContainer />

    </div>

  )
}

export default ParametersPage 
