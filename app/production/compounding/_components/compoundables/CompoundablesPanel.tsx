'use client'
import Card from '@/components/Card'
import { BatchProductionRecord } from '@/types/batchProductionRecord'
import React from 'react'
import BprCard from './BprCard'
import { useTranslation } from '@/hooks/useTranslation'
import { translations } from '../../_configs/translations'
import SectionTitle from '@/components/Text/SectionTitle'
import Alert from '@/components/Alert'
import useDialog from '@/hooks/useDialog'

type CompoundablesPanelProps = {
  compoundables: BatchProductionRecord[],
}

const CompoundablesPanel = ({ compoundables }: CompoundablesPanelProps) => {
  const { t } = useTranslation()
  const { resetDialogContext } = useDialog()

  return (
    <div className='flex flex-col gap-6'>
      <Alert.Root identifier='noScheduleDate'>
        <Alert.Content
          title={t(translations, 'scheduleAlertTitle')}
          action={() => resetDialogContext()}
          actionLabel={'Ok'}
          actionColor='secondarySoft'
        >
          {t(translations, 'scheduleAlertContent')}
        </Alert.Content>

      </Alert.Root>

      <SectionTitle>{t(translations, 'compoundablesTitle')}</SectionTitle>
      <Card.Root bg='elevated'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {compoundables.map((bpr) => <BprCard isInactive={true} bg='darker' key={bpr.id} bpr={bpr} />)}
        </div>
      </Card.Root>
    </div>

  )
}

export default CompoundablesPanel
