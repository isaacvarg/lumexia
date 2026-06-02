'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import * as Switch from "@radix-ui/react-switch"
import { Panels } from "@/components/Panels"
import Text from "@/components/Text"
import useToast from "@/hooks/useToast"
import { appActions } from "@/actions/app"

type Config = {
  id: string
  key: string
  value: string
  dataType: string
  description: string
}

type ItemType = {
  id: string
  name: string
}

type Props = {
  configs: Config[]
  itemTypes: ItemType[]
}

const ITEM_TYPE_KEY_PREFIX = 'auditTriggerItemType:'

const InventoryAuditSettingsForm = ({ configs, itemTypes }: Props) => {
  const router = useRouter()
  const { toast } = useToast()

  const initial = useMemo(() => {
    const map: Record<string, Config> = {}
    for (const c of configs) map[c.key] = c
    return map
  }, [configs])

  const [values, setValues] = useState<Record<string, string>>(() =>
    configs.reduce<Record<string, string>>((acc, c) => {
      acc[c.key] = c.value
      return acc
    }, {})
  )
  const [isSaving, setIsSaving] = useState(false)

  const setBool = (key: string) => (checked: boolean) =>
    setValues((v) => ({ ...v, [key]: checked ? 'true' : 'false' }))

  const setNum = (key: string) => (raw: string) =>
    setValues((v) => ({ ...v, [key]: raw }))

  const dirty = useMemo(
    () => configs.filter((c) => values[c.key] !== c.value).map((c) => ({ id: c.id, value: values[c.key] })),
    [configs, values]
  )

  const handleSave = async () => {
    if (dirty.length === 0) return
    try {
      setIsSaving(true)
      await appActions.configs.updateMany(dirty, '/settings/inventory')
      toast('Inventory audit settings saved', '', 'success')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast('Failed to save settings', String(err), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const lowOnHandEnabled = values['auditTriggerLowOnHandEnabled'] === 'true'
  const bprEnabled = values['auditTriggerBprUsageEnabled'] === 'true'
  const negativeEnabled = values['auditTriggerNegativeStockEnabled'] === 'true'

  return (
    <div className="flex flex-col gap-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Panels.Root>
          <div className="flex items-center justify-between">
            <Text.SectionTitle size="small">Low on-hand, no rule</Text.SectionTitle>
            <ToggleSwitch
              checked={lowOnHandEnabled}
              onChange={setBool('auditTriggerLowOnHandEnabled')}
              name="auditTriggerLowOnHandEnabled"
            />
          </div>
          <Text.Normal>{initial['auditTriggerLowOnHandRatio']?.description}</Text.Normal>
          <label className="flex flex-col gap-y-1">
            <span className="text-sm font-medium">On-hand ratio (0 – 1)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              className="input input-bordered"
              disabled={!lowOnHandEnabled}
              value={values['auditTriggerLowOnHandRatio'] ?? ''}
              onChange={(e) => setNum('auditTriggerLowOnHandRatio')(e.target.value)}
            />
          </label>
        </Panels.Root>

        <Panels.Root>
          <div className="flex items-center justify-between">
            <Text.SectionTitle size="small">High BPR usage</Text.SectionTitle>
            <ToggleSwitch
              checked={bprEnabled}
              onChange={setBool('auditTriggerBprUsageEnabled')}
              name="auditTriggerBprUsageEnabled"
            />
          </div>
          <Text.Normal>{initial['auditTriggerBprUsageThreshold']?.description}</Text.Normal>
          <label className="flex flex-col gap-y-1">
            <span className="text-sm font-medium">BPR count threshold (&gt;)</span>
            <input
              type="number"
              step="1"
              min="0"
              className="input input-bordered"
              disabled={!bprEnabled}
              value={values['auditTriggerBprUsageThreshold'] ?? ''}
              onChange={(e) => setNum('auditTriggerBprUsageThreshold')(e.target.value)}
            />
          </label>
        </Panels.Root>

        <Panels.Root>
          <div className="flex items-center justify-between">
            <Text.SectionTitle size="small">Negative stock</Text.SectionTitle>
            <ToggleSwitch
              checked={negativeEnabled}
              onChange={setBool('auditTriggerNegativeStockEnabled')}
              name="auditTriggerNegativeStockEnabled"
            />
          </div>
          <Text.Normal>{initial['auditTriggerNegativeStockEnabled']?.description}</Text.Normal>
        </Panels.Root>

      </div>

      <Panels.Root>
        <Text.SectionTitle size="small">Item categories</Text.SectionTitle>
        <Text.Normal>
          Only items in enabled categories are evaluated by the audit trigger cron. Disable a category to skip its items entirely.
        </Text.Normal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {itemTypes.map((type) => {
            const key = `${ITEM_TYPE_KEY_PREFIX}${type.id}`
            return (
              <div key={type.id} className="flex items-center justify-between gap-2">
                <span className="font-medium">{type.name}</span>
                <ToggleSwitch
                  checked={values[key] === 'true'}
                  onChange={setBool(key)}
                  name={key}
                />
              </div>
            )
          })}
        </div>
      </Panels.Root>

      <div className="flex justify-end">
        <button
          className="btn btn-neutral"
          disabled={dirty.length === 0 || isSaving}
          onClick={handleSave}
        >
          {isSaving ? <span className="loading loading-spinner" /> : null}
          Save
        </button>
      </div>
    </div>
  )
}

type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  name: string
}

const ToggleSwitch = ({ checked, onChange, name }: ToggleSwitchProps) => (
  <Switch.Root
    className="w-[42px] h-[25px] rounded-full relative border-cutty-sark-200 bg-cutty-sark-100 data-[state=checked]:bg-cutty-sark-500 outline-none cursor-default"
    checked={checked}
    onCheckedChange={onChange}
    name={name}
  >
    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-cutty-sark-600 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
  </Switch.Root>
)

export default InventoryAuditSettingsForm
