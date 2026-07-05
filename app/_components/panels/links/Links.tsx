'use client'

import Panel from "../Panel"
import { BsBox2Heart } from "react-icons/bs"
import { useRouter } from "next/navigation"

const LinkButton = ({ icon, title, path }: { icon: JSX.Element, title: string, path: string }) => {

  const router = useRouter()

  return (
    <button
      onClick={() => router.push(path)}
      className="btn btn-lg w-full h-28 flex flex-col items-center justify-center gap-2"
    >
      <span className="text-3xl">{icon}</span>
      <p className="text-lg font-medium">{title}</p>
    </button>

  )
}

const Links = () => {
  return (
    <Panel title="Quick Links">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LinkButton icon={<BsBox2Heart />} title='Request Item' path="/purchasing/requests/new" />
      </div>
    </Panel>
  )
}

export default Links
