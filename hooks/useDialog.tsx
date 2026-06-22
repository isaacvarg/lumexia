import { useContext, useCallback } from 'react';
import { DialogContext, DialogContextDefaults } from '@/context/DialogContext';

const useDialog = () => {
  const { setDialogState } = useContext(DialogContext);

  const showDialog = useCallback((activeDialogIdentifier: string) => {
    setDialogState((prevState) => ({
      ...prevState,
      isDialogOpen: true,
      activeDialogIdentifier,
    }));
  }, [setDialogState]);

  const resetDialogContext = useCallback(() => {
    setDialogState(DialogContextDefaults)
  }, [setDialogState]);

  const setDialogIdentifier = useCallback((activeDialogIdentifier: string) => {
    setDialogState((prevState) => ({
      ...prevState,
      activeDialogIdentifier,
    }));
  }, [setDialogState]);

  return { showDialog, resetDialogContext, setDialogIdentifier };
};

export default useDialog;


