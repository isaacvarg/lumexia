import Examinations from "./Examinations"
import Measurements from "./Measurements"
import Parameters from "./Parameters"

const Quality = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6">
        <Examinations />
        <Parameters />
      </div>

      <Measurements />
    </div>
  )
}

export default Quality
