import React from 'react'
import UnitsOfMeasurement from './UnitsOfMeasurement'
import UomConversions from './UomConversions'

type Props = {
  uoms: React.ComponentProps<typeof UnitsOfMeasurement>['uoms']
  conversions: React.ComponentProps<typeof UomConversions>['conversions']
}

const UnitsConfiguration = ({ uoms, conversions }: Props) => {
  return (
    <div className='grid grid-cols-2 gap-6'>
      <UnitsOfMeasurement uoms={uoms} />
      <UomConversions uoms={uoms} conversions={conversions} />
    </div>
  )
}

export default UnitsConfiguration
