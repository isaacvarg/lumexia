import PageTitle from "@/components/Text/PageTitle"
import NavigationPanels from "./_components/NavigationPanels"
import ScanPanel from "./_components/ScanPanel"
import HelperSetter from "@/components/Helper/HelperSetter"


const QcPage = () => {

  return (
    <div className='flex flex-col gap-y-6'>

      <HelperSetter section="qc" />

      <PageTitle>Quality</PageTitle>

      <NavigationPanels />


      <ScanPanel />


    </div>
  )
}

export default QcPage


