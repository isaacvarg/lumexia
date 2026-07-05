"use state"

import React, { useEffect, useMemo, useState } from 'react'
import { IBprForSSF } from '../_functions/getBprs'
import Text from '@/components/Text'
import { useWizard } from 'react-use-wizard'
import Fuse from 'fuse.js'
import Card from '@/components/Card'

const BprSelectionStep = ({ bprs, onSelection }: { bprs: IBprForSSF[], onSelection: (bpr: IBprForSSF) => void }) => {
    const [searchInput, setSearchInput] = useState('')
    const [results, setResults] = useState<IBprForSSF[]>([])
    const { nextStep } = useWizard()

    const searcher = useMemo(() => {
        const searchOptions = {
            keys: [
                "referenceCode",
                "producedItemIID",
                "producedItemName"

            ]
        }
        return new Fuse(bprs, searchOptions)
    }, [bprs])

    const handleItemClick = (bpr: IBprForSSF) => {
        onSelection(bpr);
        nextStep()

    }

    const handleKeydown = (event: any) => {
        if (event.key === "Enter") {
            const firstResult = results[0];
            handleItemClick(firstResult);
        }
    };

    useEffect(() => {
        const searchResults = searcher.search(searchInput);
        const mappedResults = searchResults.map((s) => s.item);
        setResults(mappedResults);
    }, [searchInput, searcher]);


    return (
        <div className='flex flex-col gap-y-4'>

            <Text.SectionTitle>Select a BPR</Text.SectionTitle>


            <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>


                <Card.Root>
                    <Text.SectionTitle size='small'>Search</Text.SectionTitle>

                    <input
                        placeholder="Search Name, Alias or Code"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeydown}
                        className="w-full bg-slate-200 py-2 px-4 rounded-lg text-poppins text-lg mb-6"
                    />

                    <ul>
                        <div className="flex flex-col gap-y-4 overflow-y-auto max-h-[600px]">
                            {results.map((bpr) => (
                                <li className="border-2 rounded-lg px-4 py-2" key={bpr.bprId} onClick={() => handleItemClick(bpr)}>
                                    <p>{`${bpr.producedItemName} <${bpr.bprReferenceCode}> <${bpr.lotNumber}>`} </p>
                                </li>
                            ))}
                        </div>
                    </ul>
                </Card.Root>


                <Card.Root>
                    <Text.SectionTitle size='small'>Lastest</Text.SectionTitle>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>

                        {bprs.slice(0, 10).map((bpr) => {
                            return (
                                <div onClick={() => handleItemClick(bpr)} key={bpr.bprId} className='flex flex-col gap-y-2 rounded-xl px-4 py-2 bg-neutral-100'>
                                    <h1 className='font-poppins text-xl font-semibold text-neutral-700'>{bpr.lotNumber}</h1>

                                    <h2 className='font-poppins text-lg font-normal'>{bpr.producedItemName}</h2>


                                    <h2 className='font-poppins text-lg font-normal'># {bpr.bprReferenceCode}</h2>
                                </div>
                            )
                        })}

                    </div>

                </Card.Root>
            </div>

        </div >
    )
}

export default BprSelectionStep
