import SectionTitle from "@/components/Text/SectionTitle"
import { useQcExaminationSelection } from "@/store/qcExaminationSlice"
import ParameterList from "./ParameterList"
import SelectedParameter from "./SelectedParameter"

const Results = () => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
      <ParameterList />

      <SelectedParameter />

    </div>
  )
}

export default Results
