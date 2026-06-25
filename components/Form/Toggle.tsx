import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
type FormSwitchFieldProps = {
  form: UseFormReturn<any>;
  fieldName: string
  label: string
};

const ToggleField = ({ form, fieldName, label }: FormSwitchFieldProps) => {


  return (
    <>
      <label className="font-poppins text-neutral-950 text-xl">
        {label}
      </label>
      <Controller
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            name={fieldName}
          />
        )}
      />
    </>
  );
};
export default ToggleField;
