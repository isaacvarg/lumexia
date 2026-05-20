import { useFieldContext } from "."

const classes = {
  label: {
    default: "font-medium text-xl text-base-content",
    soft: "font-normal text-lg text-base-content/70",
  },
  errors: {
    default: "font-medium text-lg text-error underline decoration-wavy decoration-error"
  }
}

type NumberFieldProps = {
  label: string,
  labelClass?: keyof typeof classes.label,
  errorClass?: keyof typeof classes.errors,
  description?: string,
}

const NumberField = ({ label, description, labelClass = 'default', errorClass = 'default' }: NumberFieldProps) => {

  const field = useFieldContext<number>()
  const meta = field.state.meta;
  const errors = meta.errors.map(e => e.message).join(',');

  return (
    <div className="flex flex-col gap-2">
      <label className={classes.label[labelClass]}>{label}</label>
      {description && <p className="font-light text-lg text-base-content/80">{description}</p>}
      <input
        value={field.state.value}
        className="input w-full input-lg"
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        onWheel={(e) => e.currentTarget.blur()}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey &&
            !e.nativeEvent.isComposing
          ) {
            e.preventDefault();
            field.form.handleSubmit();
          }
        }}
        type="number"
      />
      {meta.isTouched && meta.errors.length > 0 ? (
        <p className={classes.errors[errorClass]}>{errors}</p>
      ) : null}
    </div>
  )
}

export default NumberField


