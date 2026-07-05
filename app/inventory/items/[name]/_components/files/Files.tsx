import Upload from "./Upload"
import View from "./View"

const Files = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      <Upload />
      <View />

    </div>
  )
}

export default Files
