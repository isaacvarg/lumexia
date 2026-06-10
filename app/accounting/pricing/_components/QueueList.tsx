'use client'

import { usePricingQueue } from "@/hooks/appQuery/usePricingQueue"
import { useRouter } from "next/navigation"

const QueueList = () => {

    const router = useRouter()
    const { data: queue, isLoading } = usePricingQueue()

    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-1">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-full" />
            </div>
        )
    }
    if (!queue || queue.length === 0) {
        return (
            <p className="font-poppins text-xl">None queued 👍🏽👍🏽🫰🏽🫰🏽</p>
        )
    }


    return (
        <div className="grid grid-cols-1 gap-2">

            {queue.map((exam) => {
                return (
                    <div
                        key={exam.id}
                        className="flex px-4 py-2 rounded-xl bg-base-200 text-base-content font-poppins text-xl font-medium hover:bg-base-300 hover:cursor-pointer"
                        onClick={() => router.push(`/accounting/pricing/${exam.examinedItem.referenceCode}/new?id=${exam.examinedItem.id}&examId=${exam.id}`)}
                    >
                        {exam.examinedItem.name}
                    </div>
                )
            })}

        </div>
    )
}

export default QueueList
