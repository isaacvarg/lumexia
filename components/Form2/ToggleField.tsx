import { useFieldContext } from "."

const classes = {
  label: {
    default: "font-medium text-xl text-base-content",
    soft: "font-normal text-lg text-base-content/70",
  }
}

type ToggleFieldProps = {
  label: string,
  labelClass?: keyof typeof classes.label
}

const ToggleField = ({ label, labelClass = 'default' }: ToggleFieldProps) => {

  const field = useFieldContext<boolean>()

  return (
    <div className="flex flex-col gap-2">
      <label className={classes.label[labelClass]}>{label}</label>

      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={field.state.value}
        onChange={(e) => field.handleChange(e.target.checked)}
      />
    </div>
  )
}

export default ToggleField


