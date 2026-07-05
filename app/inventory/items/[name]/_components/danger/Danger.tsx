import ArchiveButton from "./ArchiveButton"
import ChangeInventoryUom from "./ChangeInventoryUom"
import ExportDataVerificationPackage from "./ExportDataVerificationPackage"

const Danger = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

      <ArchiveButton />

      <ChangeInventoryUom />

      <ExportDataVerificationPackage />

    </div>
  )
}

export default Danger
