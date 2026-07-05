import SectionTitle from "@/components/Text/SectionTitle"
import InternalNotes from "./InternalNotes"
import PublicNotes from "./PublicNotes"
import PoSupplierNotes from "./SupplierNotes"

const Notes = () => {
  return (
    <div className="flex flex-col gap-6">


      <SectionTitle>Internal</SectionTitle>
      <InternalNotes />

      <SectionTitle>Public Notes</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <PublicNotes />
        <PoSupplierNotes />

      </div>

    </div>
  )
}

export default Notes
