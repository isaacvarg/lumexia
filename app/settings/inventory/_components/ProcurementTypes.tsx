import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"

const ProcurementTypes = () => {


  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Procurement Types</SectionTitle>

      <Card.Root>
        <div className="flex flex-col justify-start gap-4">
          <p className="font-poppins text-xl text-base-content">These cannot be modified but are shown here for reference.</p>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-xl text-base-content">Purchased</label>
            <p className="font-light text-lg text-base-content/80">Items acquired via purchasing from suppliers</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-xl text-base-content">Produced</label>
            <p className="font-light text-lg text-base-content/80">Items created through manufacturing in-house.</p>
          </div>
        </div>

      </Card.Root>
    </div>


  )
}

export default ProcurementTypes
