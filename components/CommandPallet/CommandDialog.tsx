'use client'
import { useCommandPalletActions, useCommandPalletSelection } from '@/store/commandPalletSlice'
import { FloatingFocusManager, FloatingOverlay, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react'

import { useHotkeys } from 'react-hotkeys-hook'
import CommandCenter from './CommandCenter'

const CommandDialog = () => {
  const { isOpen } = useCommandPalletSelection()
  const { togglePallet } = useCommandPalletActions()


  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: togglePallet

  })

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
  });
  const role = useRole(context);

  const { getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Set up label and description ids
  const labelId = useId();
  const descriptionId = useId();


  // hotkeys
  // using this library instead of useEffect and event listeners     
  useHotkeys('ctrl+k', () => togglePallet(), { preventDefault: true })



  return (
    <>

      {isOpen && (
        <FloatingOverlay
          className='z-50 flex items-center justify-center p-4 backdrop-blur-sm'
        >
          <FloatingFocusManager context={context}>
            <div
              className='bg-white p-4 md:p-6 rounded-lg flex flex-col w-full max-w-[600px] sm:min-w-[600px] min-h-[400px] shadow-xl border '
              ref={refs.setFloating}
              aria-labelledby={labelId}
              aria-describedby={descriptionId}
              {...getFloatingProps()}
            >
              <CommandCenter />
            </div>

          </FloatingFocusManager>
        </FloatingOverlay>)}
    </>
  )
}

export default CommandDialog 
