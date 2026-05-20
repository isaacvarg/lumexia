
import { useStore } from "@tanstack/react-form";
import { useFormContext } from ".";

type SubmitButtonProps = {
  children?: React.ReactNode;
};

const SubmitButton = ({
  children,
}: SubmitButtonProps) => {
  const form = useFormContext();

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const disabled = isSubmitting;

  return (
    <button
      type="submit"
      className={`btn ${disabled ? "btn-disabled" : "btn-success"}`}
      disabled={disabled}
    >
      {children ?? "Save"}
    </button>
  );
};

export default SubmitButton;

