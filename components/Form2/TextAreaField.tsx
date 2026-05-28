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

type TextAreaFieldProps = {
  label: string,
  labelClass?: keyof typeof classes.label,
  errorClass?: keyof typeof classes.errors,
  description?: string,
  rows?: number,
}

const TextAreaField = ({ label, description, labelClass = 'default', errorClass = 'default', rows = 4 }: TextAreaFieldProps) => {

  const field = useFieldContext<string>()
  const meta = field.state.meta;
  const errors = meta.errors.map(e => e.message).join(',');

  return (
    <div className="flex flex-col gap-2">
      <label className={classes.label[labelClass]}>{label}</label>
      {description && <p className="font-light text-lg text-base-content/80">{description}</p>}
      <textarea
        value={field.state.value ?? ""}
        rows={rows}
        className="textarea textarea-lg w-full"
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {meta.isTouched && meta.errors.length > 0 ? (
        <p className={classes.errors[errorClass]}>{errors}</p>
      ) : null}
    </div>
  )
}

export default TextAreaField
