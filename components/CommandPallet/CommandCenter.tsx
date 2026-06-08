import React, { useCallback, useRef, useState } from 'react'
import useCommandPalletPages from './Commands/Pages'
import CommandButton from './CommandButton'
import { Search } from '../Search'
import useCommandPalletItems from './Commands/Items'
import { Command } from './CommandType'

export type MergedCommandData = Command[]//(Command | Item)[]


const CommandCenter = () => {

    const pages = useCommandPalletPages()
    const items = useCommandPalletItems()
    const [input, setInput] = useState('');
    const mergedData = [...pages, ...items]
    const [results, setResults] = useState<Command[]>([])

    // Keep a ref to the latest input so the debounced onQueryComplete callback
    // can tell whether its results are stale. SearcherUnmanaged returns the full
    // dataset when the input is empty; we never render that (we show `pages`
    // instead), so drop it to avoid a transient full-list render on the first
    // keystroke that would expand the dialog then snap back.
    const inputRef = useRef(input)
    inputRef.current = input
    const handleResults = useCallback((next: Command[]) => {
        setResults(inputRef.current.trim() === '' ? [] : next)
    }, [])

    return (
        <div className='flex flex-col gap-y-2'>

            <Search.SearcherUnmanaged
                data={mergedData}
                keys={['label', 'terms']}
                onQueryComplete={handleResults}
                input={input}
                setInput={setInput}

            />
            <div className='flex flex-col gap-y-1 max-h-[575px] overflow-y-auto'>

                {!input && (
                    pages.map((page, index) => {
                        return (
                            <CommandButton key={index} command={page} index={index} />
                        )
                    })

                )}

                {input && results.map((result, index) => <CommandButton key={index} command={result} index={index} />)}
            </div>

        </div>
    )
}

export default CommandCenter 
