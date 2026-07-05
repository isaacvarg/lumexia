import Examinations from "./Examinations"
import LastExamination from "./LastExamination"
import Parameters from "./Parameters"

const Pricing = () => {
  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      <LastExamination />
      <Parameters />
      <Examinations />

    </div>
  )
}

export default Pricing
