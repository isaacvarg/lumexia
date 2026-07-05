
const classes = {
  bg: {
    default: 'bg-base-100 ',
    white: 'bg-base-100',
    elevated: 'bg-base-300',

  },
  base: 'flex flex-col p-4 md:p-6 rounded-lg',
  gap: {
    default: 'gap-y-4',
    noGap: ''
  },
  span: {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
  },
  border: {
    none: '',
    outline: 'border border-2 border-neutral-700',
  }
}

interface RootProps {
  children: React.ReactNode,
  bg?: keyof typeof classes.bg,
  span?: keyof typeof classes.span,
  gap?: keyof typeof classes.gap
  border?: keyof typeof classes.border,
}


const Root = ({
  children,
  bg = 'default',
  span = 1,
  gap = 'default',
  border = 'none'
}: RootProps) => {

  return (
    <div className={`${classes.base} ${classes.bg[bg]} ${classes.span[span]} ${classes.gap[gap]} ${classes.border[border]}`}>
      {children}
    </div>
  )
}

export default Root
