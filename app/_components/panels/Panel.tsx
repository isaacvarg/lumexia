'use client'
import Card from "@/components/Card"
import { useRouter } from "next/navigation"

type Props = {
  children: React.ReactNode,
  title: string
  titlePath?: string
  span?: 1 | 2 | 3
}

const classes = {
  span: {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
  }
}
const Panel = ({ children, title, span = 1, titlePath = '/' }: Props) => {

  const router = useRouter()
  const handlePanelTitleClick = () => {
    router.push(titlePath)
  }

  return (
    <div className={`${classes.span[span]} min-w-0`}>
      <Card.Root bg="base" shadow="base">
        <div onClick={() => handlePanelTitleClick()} className="hover:cursor-pointer hover:text-lilac-500 w-fit">
          <Card.Title>{title}</Card.Title>
        </div>
        <div className="min-w-0">
          {children}
        </div>
      </Card.Root>
    </div>
  )
}

export default Panel
