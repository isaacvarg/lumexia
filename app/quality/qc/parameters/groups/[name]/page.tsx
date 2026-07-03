import { qualityActions } from "@/actions/quality"
import PageTitle from "@/components/Text/PageTitle"
import Form from "./_components/Form"
import Parameters from "./_components/Parameters"
import HelperSetter from "@/components/Helper/HelperSetter"

type Props = {
  searchParams: {
    id: string
  }
}
const GroupsPage = async ({ searchParams }: Props) => {

  const group = await qualityActions.qc.groups.getOne(searchParams.id)
  const examinationTypes = await qualityActions.qc.examinationTypes.getAll();

  return (
    <div className="flex flex-col gap-6">
      <HelperSetter section="qc-param-groups" />
      <PageTitle>{group.name} Parameter Group</PageTitle>

      <Form examinationTypes={examinationTypes} group={group} />

      <Parameters group={group} />



    </div>

  )
}

export default GroupsPage
