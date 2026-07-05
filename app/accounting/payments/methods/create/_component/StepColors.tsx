import { Dispatch, SetStateAction, useEffect } from "react"
import { PaymentMethodColors } from "./PaymentMethodWizard"
import { useForm } from "react-hook-form"
import Form from "@/components/Form";

const StepColors = ({ setColors, nextStep, step, colors, }: { colors: PaymentMethodColors, setColors: Dispatch<SetStateAction<PaymentMethodColors>>, nextStep: () => void, step: number, }) => {
    const form = useForm<PaymentMethodColors>({defaultValues: colors});


    const { watch } = form;

    const handleSubmit = (data: PaymentMethodColors) => {
        setColors(data);
        nextStep();
    }

    useEffect(() => {
        const subscription = watch((value) => {
            setColors(prevData => ({ ...prevData, ...value }));
        });

        return () => subscription.unsubscribe();
    }, [watch, setColors]);

    if (step !== 2) return false


    return (
        <Form.Root form={form} onSubmit={handleSubmit}>

            <div className="flex items-center justify-center flex-col">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                    <Form.Color form={form} fieldName="bgColorA" label="Background A" />
                    <Form.Color form={form} fieldName="bgColorB" label="Background B" />
                    <Form.Color form={form} fieldName="circleColorA" label="Circle A" />
                    <Form.Color form={form} fieldName="circleColorB" label="Circle B" />
                </div>
            </div>

            <div className="flex justify-end gap-x-4">

                <button className="btn " onClick={() => console.info('there is no going back hehe')} >Back</button>
                <button className="btn btn-success" type="submit">Next Step</button>

            </div>




        </Form.Root>
    )
}

export default StepColors
