'use client'
import { useRouter } from "next/navigation"
import { TbPlus } from "react-icons/tb"

const NavigationPanels = () => {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">


      <button
        className="btn btn-xl btn-secondary min-h-32 hover:btn-secondary/30 hover:cursor-pointer flex items-center gap-2"
        onClick={() => router.push('/quality/qc/examination/new')}>
        <TbPlus className="size-4" />
        New
      </button>
      <button className="btn btn-xl btn-secondary min-h-32 hover:btn-secondary/30 hover:cursor-pointer" onClick={() => router.push('/quality/qc/examination/')}>Examinations</button>
      <button className="btn btn-xl btn-secondary min-h-32 hover:btn-secondary/30 hover:cursor-pointer" onClick={() => router.push('/quality/qc/parameters/')}>Parameters</button>

    </div>
  )
}

export default NavigationPanels
