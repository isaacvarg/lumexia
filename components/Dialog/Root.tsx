"use client";
import { DialogContext } from "@/context/DialogContext";
import useDialog from "@/hooks/useDialog";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import * as Dialog from "@radix-ui/react-dialog";

import React, { useContext } from "react";

type DialogRootProps = {
    children: React.ReactNode;
    identifier: string;
    // Overrides only the size portion of the content classes.
    // Defaults to the standard centered dialog size.
    contentClassName?: string;
};

const Root = ({ children, identifier, contentClassName = "max-h-[92vh] md:max-h-[85vh] w-[95vw] max-w-[95vw] md:w-3/5 md:max-w-3/5" }: DialogRootProps) => {
    const { isDialogOpen, activeDialogIdentifier } = useContext(DialogContext);
    const { resetDialogContext } = useDialog();

    const handleDialogChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetDialogContext();
        }
    }

    if (activeDialogIdentifier !== identifier) {
        return null;
    }


    return (

        <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-base-300/70 data-[state=open]:animate-overlayShow fixed inset-0 z-50">
                    <Dialog.Content aria-describedby="Dialog content" className={`data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] ${contentClassName} translate-x-[-50%] translate-y-[-50%] overflow-y-auto overflow-x-hidden rounded-[6px] bg-base-100 p-4 md:p-8 shadow-md focus:outline-none`}>
                        <VisuallyHidden.Root> <Dialog.Title>Dialog</Dialog.Title></VisuallyHidden.Root>
                        {children}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root >
    );
};


export default Root;
