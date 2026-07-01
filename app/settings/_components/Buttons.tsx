'use client'

import { useRouter } from "next/navigation"
import { useAppSelection } from "@/store/appSlice"
import { TbTool, TbBox, TbUsers, TbBuilding, TbFlask, TbChevronRight } from "react-icons/tb"
import { IconType } from "react-icons"

type SettingCard = {
  label: string
  description: string
  href: string
  icon: IconType
}

const Buttons = () => {

  const router = useRouter()
  const { user } = useAppSelection()
  console.log(user)
  const isSystemAdmin = user?.roles.isSystemAdmin
  console.log(isSystemAdmin)

  const cards: SettingCard[] = [
    { label: "Inventory", description: "Configure inventory settings", href: "settings/inventory", icon: TbBox },
    { label: "Production", description: "Configure production settings", href: "settings/production", icon: TbFlask },
    ...(isSystemAdmin
      ? [
        { label: "Manage Users", description: "Add, edit, and assign user roles", href: "settings/users", icon: TbUsers } as SettingCard,
        { label: "Company Settings", description: "Manage company info and images", href: "settings/company", icon: TbBuilding } as SettingCard,
      ]
      : []),

    { label: "Fixes", description: "Manage and apply system fixes", href: "settings/fixes", icon: TbTool },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map(({ label, description, href, icon: Icon }) => (
        <button
          key={href}
          onClick={() => router.push(href)}
          className="card bg-base-100 border border-base-300 text-left transition-all duration-200 cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-primary"
        >
          <div className="card-body flex-row items-center gap-4">
            <div className="grid place-items-center rounded-lg bg-primary/10 text-primary p-3">
              <Icon className="text-2xl" />
            </div>
            <div className="flex-1">
              <h2 className="card-title text-base">{label}</h2>
              <p className="text-sm text-base-content/60">{description}</p>
            </div>
            <TbChevronRight className="text-xl text-base-content/40" />
          </div>
        </button>
      ))}
    </div>
  )
}

export default Buttons
