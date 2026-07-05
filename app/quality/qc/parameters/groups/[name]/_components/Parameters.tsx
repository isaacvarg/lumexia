import { QcTemplate } from "@/actions/quality/qc/templates/getAll"
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import ParameterCard from "./ParameterCard"
import { QcParameterGroup } from "@/actions/quality/qc/groups/getAll"

const Parameters = ({ group }: { group: QcParameterGroup }) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle>Parameters Included</SectionTitle>
      <Card.Root>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {group.parameters.map(p => <ParameterCard key={p.id} parameter={p} />)}
        </div>

      </Card.Root>
    </div>

  )
}

export default Parameters
