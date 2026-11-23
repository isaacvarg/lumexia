"use client"
import { SelectOption } from "@/types/selectOption";
import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";

type SelectFieldProps = {
  form: UseFormReturn<any>;
  label: string;
  fieldName: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
};

const SelectField = ({ form, label, fieldName, options, placeholder, required }: SelectFieldProps) => {
  return (
    <div className='flex flex-col gap-y-1'>
      <label className="font-poppins text-base-content text-xl">{label}</label>
      <Controller
        control={form.control}
        name={fieldName}
        rules={{ required }}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {form.formState.errors[fieldName] && <span className="text-error">This field is required</span>}
    </div>
  );
};

export default SelectField;
