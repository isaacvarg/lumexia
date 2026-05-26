import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { useQcExaminationActions, useQcExaminationSelection } from "@/store/qcExaminationSlice"

const ParameterList = () => {

  const { itemParameters, selectedItemParameter, results } = useQcExaminationSelection()
  const { setSelectedItemParameter } = useQcExaminationActions()

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle >Parameters</SectionTitle>

      <Card.Root>
        <div className="grid grid-cols-1 gap-2">
          {itemParameters.map(ip => {
            const isSelected = ip.id === selectedItemParameter?.id
            const runCount = results.get(ip.id)?.length ?? 0
            return (
              <button
                key={ip.id}
                className={`btn ${isSelected ? 'btn-accent' : 'btn-secondary btn-outline'}`}
                onClick={() => setSelectedItemParameter(ip)}
              >
                <span>{ip.parameter.name}</span>
                {runCount > 0 && (
                  <span className="badge badge-sm">{runCount}</span>
                )}
              </button>
            )
          })}
        </div>
      </Card.Root>
    </div>

  )
}

export default ParameterList
