import React from 'react'
type PanelProps = {
	children: React.ReactNode
	bg?:  keyof typeof classes.bg
	gapY?: keyof typeof classes.gapY
}

const classes = {
	bg: {
		'neutral': 'bg-cararra-100',
		'linen': 'bg-linen-100',
		'bayLeaf': 'bg-bay-leaf-100',
	},
	gapY: {
		4: 'gap-y-4',
	}
}

const Panel = ({children, bg = 'neutral', gapY = 4} : PanelProps) => {
  return (
    <div className={`flex flex-col ${classes.bg[bg]} ${classes.gapY[gapY]} p-4 md:p-8 rounded lg`}>{children}</div>
  )
}

export default Panel
