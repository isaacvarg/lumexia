import { qualityActions } from "@/actions/quality"
import PageTitle from "@/components/Text/PageTitle"
import ManualEntry from "./_components/ManualEntry"
import HelperSetter from "@/components/Helper/HelperSetter"

const NewParametersPage = async () => {

  const dataTypes = await qualityActions.qc.dataTypes.getAll();

  return (
    <div className='flex flex-col gap-y-6'>
      <HelperSetter section="qc-param-detail" />
      <PageTitle>New Parameter</PageTitle>

      <ManualEntry dataTypes={dataTypes} />

    </div>

  )
}

export default NewParametersPage 
