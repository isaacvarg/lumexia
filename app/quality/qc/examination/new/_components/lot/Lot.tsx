import Bprs from "./Bprs"
import Purchases from "./Purchases"
import Search from "./Search"

const Lot = () => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Search />
      <Bprs />
      <Purchases />
    </div>
  )
}

export default Lot
