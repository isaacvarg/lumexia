'use client'

import { useProductionSelection } from "@/store/productionSlice"
import { useTranslation } from "@/hooks/useTranslation"
import { translations } from "../../_configs/translations"
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { getActiveStage, getOverviewData, OverviewItem, OverviewStage } from "./getOverviewData"

// Lifecycle order used for the daisy `steps` rail.
const LIFECYCLE: { stage: OverviewStage; labelKey: keyof typeof translations }[] = [
  { stage: 'staging', labelKey: 'overviewStageStaging' },
  { stage: 'primary', labelKey: 'overviewStagePrimary' },
  { stage: 'secondary', labelKey: 'overviewStageSecondary' },
  { stage: 'compounding', labelKey: 'overviewStageCompounding' },
]

const ProgressOverview = () => {
  const { steps, bom, viewStatuses } = useProductionSelection()
  const { t } = useTranslation()

  const stage = getActiveStage(viewStatuses)
  const { teamKey, progressLabelKey, completed, total, items } = getOverviewData(stage, steps, bom)

  const activeIndex = LIFECYCLE.findIndex(l => l.stage === stage)
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  const doneItems = items.filter(i => i.state === 'done')
  const remainingItems = items.filter(i => i.state !== 'done')

  return (
    <div className="flex flex-col gap-6">

      {/* Waiting-on banner */}
      <div role="alert" className="alert alert-warning">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-poppins text-lg font-semibold">{t(translations, 'overviewWaitingOn')}</span>
            <span className="badge badge-neutral badge-lg font-medium">{t(translations, teamKey)}</span>
          </div>
          <span className="text-sm opacity-80">{t(translations, 'overviewWaitingOnHelp')}</span>
        </div>
      </div>

      {/* Lifecycle rail */}
      <ul className="steps w-full">
        {LIFECYCLE.map((entry, index) => {
          const bg = index < activeIndex ? 'step-success' : index === activeIndex ? 'step-accent' : ''
          return (
            <li
              key={entry.stage}
              data-content={index < activeIndex ? '✓' : index + 1}
              className={`step ${bg} font-poppins text-sm font-medium text-base-content`}
            >
              {t(translations, entry.labelKey)}
            </li>
          )
        })}
      </ul>

      {/* Progress bar */}
      <Card.Root>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="font-poppins text-lg font-semibold text-base-content">{t(translations, progressLabelKey)}</span>
            <span className="text-base-content/80 text-lg font-medium">{completed} / {total}</span>
          </div>
          <progress className="progress progress-success w-full" value={completed} max={total || 1} />
          <span className="text-sm text-base-content/60">{percent}%</span>
        </div>
      </Card.Root>

      {/* Remaining checklist */}
      <div className="flex flex-col gap-4">
        <SectionTitle size="normal">{t(translations, 'overviewRemaining')}</SectionTitle>
        <Card.Root>
          <div className="flex flex-col gap-4">
            {remainingItems.length === 0 && (
              <p className="text-base-content text-lg font-medium">{t(translations, 'overviewNothingRemaining')}</p>
            )}
            {remainingItems.map(item => <OverviewRow key={item.id} item={item} t={t} />)}
          </div>
        </Card.Root>
      </div>

      {/* Completed checklist */}
      {doneItems.length > 0 && (
        <div className="flex flex-col gap-4">
          <SectionTitle size="normal">{t(translations, 'overviewCompleted')}</SectionTitle>
          <Card.Root>
            <div className="flex flex-col gap-4">
              {doneItems.map(item => <OverviewRow key={item.id} item={item} t={t} />)}
            </div>
          </Card.Root>
        </div>
      )}

    </div>
  )
}

type RowProps = {
  item: OverviewItem
  t: (map: typeof translations, key: keyof typeof translations) => string
}

const stateBadge: Record<OverviewItem['state'], { classes: string; labelKey: keyof typeof translations }> = {
  done: { classes: 'badge-success', labelKey: 'overviewDone' },
  current: { classes: 'badge-info', labelKey: 'overviewCurrent' },
  pending: { classes: 'badge-ghost', labelKey: 'overviewPending' },
}

const OverviewRow = ({ item, t }: RowProps) => {
  const badge = stateBadge[item.state]
  return (
    <div
      className={`flex gap-4 items-center justify-between rounded-lg px-4 py-3 ${item.state === 'current' ? 'bg-info/10 border border-info/40' : 'bg-base-200'}`}
    >
      <div className="flex gap-4 items-center min-w-0">
        <div className="rounded-full bg-secondary text-center flex items-center justify-center text-secondary-content px-4 py-1.5 text-sm font-medium shrink-0">
          {item.sequence}
        </div>
        <span className={`truncate ${item.state === 'done' ? 'line-through text-base-content/60' : 'text-base-content'}`}>
          {item.label}
        </span>
      </div>
      <span className={`badge ${badge.classes} badge-md font-medium shrink-0`}>{t(translations, badge.labelKey)}</span>
    </div>
  )
}

export default ProgressOverview
