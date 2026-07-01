import { getUserConfig } from "@/actions/users/getUserConfig"
import { getProducibleBprs } from "./_actions/getProducibleBprs"
import Bprs from "./_components/bprs/Bprs";
import { SPAN_DISPLAY_CONFIG_NAME } from "./_components/bprs/spanUtils";
import Timers from "./_components/timers/Timers"

const BprProductionPage = async () => {

  const [bprs, spanDisplayConfig] = await Promise.all([
    getProducibleBprs(),
    getUserConfig(SPAN_DISPLAY_CONFIG_NAME),
  ]);
  // active timers
  // this week
  // next week
  return (
    <div className="flex flex-col gap-6">
      <Timers />
      <Bprs bprs={bprs} spanDisplay={spanDisplayConfig?.value} />
    </div>
  )
}

export default BprProductionPage
