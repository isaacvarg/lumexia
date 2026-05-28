import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SubmitButton from "./SubmitButton";
import ToggleField from "./ToggleField";
import SelectField from "./SelectField";
import NumberField from "./NumberField";

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextAreaField,
    ToggleField,
    SelectField,
    NumberField,
  },
  formComponents: {
    SubmitButton,
  },
});
