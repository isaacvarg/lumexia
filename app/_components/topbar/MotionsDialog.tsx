'use client'
import Dialog from "@/components/Dialog"
import SectionTitle from "@/components/Text/SectionTitle"
import { useMemo } from "react"

type Keybind = {
  keybind: string,
  description: string
}

type Motion = {
  identifier: string,
  label: string,
  description?: string
  motions: Keybind[]
}

const MotionsDialog = ({ segments }: { segments: string[] }) => {

  const motions: Motion[] = [
    {
      identifier: 'global',
      label: 'Global',
      description: 'Works on any page',
      motions: [
        {
          keybind: 'ctrl + /',
          description: 'Shows this shortcut cheatsheet'
        },
        {
          keybind: 'ctrl + k',
          description: 'Command Pallet'
        }
      ]
    },
    {
      identifier: 'purchase-orders',
      label: 'Purchase Orders',
      description: 'Ways to quickly modify a purchase order and its items.',
      motions: [
        {
          keybind: 'ctrl + e',
          description: 'Toggle Modify Mode'
        },
        {
          keybind: 'ctrl + r',
          description: 'Add Item Row',
        }
      ]

    }
  ]

  const sortedMotions = useMemo(() => {
    return [...motions].sort((a, b) => {
      const aHasMatch = segments.some(s => s === a.identifier)
      const bHasMatch = segments.some(s => s === b.identifier)
      if (aHasMatch && !bHasMatch) return -1
      if (!bHasMatch && aHasMatch) return 1
      return 0
    })
  }, [segments])

  return (
    <Dialog.Root identifier="motions">
      <div className="flex flex-col gap-6">
        <SectionTitle>Keybinds</SectionTitle>

        {sortedMotions.map(m => {
          return (
            <div
              key={m.identifier}
              className="flex flex-col gap-6"
            >

              <div className="flex flex-col gap-1">
                <SectionTitle size="small">{m.label}</SectionTitle>
                <p className="font-poppins text-lg text-base-content">{m.description}</p>
              </div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {m.motions.map(k => {
                  return (
                    <div
                      className="flex justify-between bg-base-300/70 rounded-xl p-4"
                      key={k.keybind}
                    >
                      <label className="font-poppins text-lg font-semibold">{k.description}</label>
                      <div className="kbd kbd-xl">{k.keybind}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

      </div>
    </Dialog.Root>
  )
}

export default MotionsDialog
