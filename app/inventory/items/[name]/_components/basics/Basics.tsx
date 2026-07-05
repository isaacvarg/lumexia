'use client'

import Activity from "./Activity"
import Aliases from "./Aliases"
import ItemProperties from "./ItemProperties"
import Notes from "./Notes"

const Basics = () => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      <ItemProperties />

      <Aliases />
      <Notes />
      <Activity />



    </div>
  )
}

export default Basics
