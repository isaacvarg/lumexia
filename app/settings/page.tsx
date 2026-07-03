import PageTitle from "@/components/Text/PageTitle"
import Buttons from "./_components/Buttons"
import HelperSetter from "@/components/Helper/HelperSetter"

const SettingsPage = () => {

  return (
    <div className="flex flex-col gap-y-6">

      <HelperSetter section="settings" />

      <PageTitle>Settings</PageTitle>

      <Buttons />



    </div>


  )
}

export default SettingsPage 
