
import Card from '@/components/Card'
import StepCard from './StepCard'
import { sortByProperty } from '@/utils/data/sortByProperty'
import { ExBprBatchStep } from '@/types/bprBatchStep'

const AllStepsPanel = ({ steps }: { steps: ExBprBatchStep[] }) => {

        const sortedSteps = sortByProperty(steps, "batchStep.sequence")
        return (
                <Card.Root>
                        <Card.Title>All Steps</Card.Title>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                                {sortedSteps.map((step) => <StepCard key={step.id} step={step} isReadOnly={true} isLocked={false} />)}
                        </div>
                </Card.Root>
        )
}

export default AllStepsPanel
