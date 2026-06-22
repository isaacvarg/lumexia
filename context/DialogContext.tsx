"use client";

import React, { useState, createContext } from "react";

interface DialogState {
  isDialogOpen: boolean;
  activeDialogIdentifier: string | null;
}

interface DialogProps extends DialogState {
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
}

export const DialogContext = createContext<DialogProps>({
  isDialogOpen: false,
  activeDialogIdentifier: null,
  setDialogState: () => { },
});

type DialogContextProps = {
  children: React.ReactNode;
};
// allows us to reset from hooks or elsewhere
export const DialogContextDefaults = {
  isDialogOpen: false,
  activeDialogIdentifier: null,
};

export const DialogContextProvider = ({
  children,
}: DialogContextProps) => {
  const [dialogState, setDialogState] = useState<DialogState>(
    DialogContextDefaults
  );

  return (
    <DialogContext.Provider
      value={{ ...dialogState, setDialogState }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export default DialogContextProvider;


