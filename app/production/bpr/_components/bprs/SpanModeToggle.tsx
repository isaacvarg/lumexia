"use client"
import { updateUserConfig } from '@/actions/users/updateUserConfig'
import { userConfigGroups } from '@/configs/staticRecords/userConfigGroups'
import React from 'react'
import { SPAN_DISPLAY_CONFIG_NAME, SpanDisplay } from './spanUtils'

const OPTIONS: { value: SpanDisplay; label: string }[] = [
  { value: 'chips', label: 'Chips' },
  { value: 'compact', label: 'Compact' },
  { value: 'timeline', label: 'Timeline' },
]

const SpanModeToggle = ({
  mode,
  onChange,
}: {
  mode: SpanDisplay
  onChange: (mode: SpanDisplay) => void
}) => {
  const handleSelect = (value: SpanDisplay) => {
    if (value === mode) return
    onChange(value)
    // Persist in the background; local state drives the instant switch.
    void updateUserConfig(SPAN_DISPLAY_CONFIG_NAME, value, userConfigGroups.general)
  }

  return (
    <div className='join'>
      {OPTIONS.map(option => (
        <button
          key={option.value}
          type='button'
          onClick={() => handleSelect(option.value)}
          className={`btn btn-sm join-item ${mode === option.value ? 'btn-primary' : 'btn-ghost'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SpanModeToggle
