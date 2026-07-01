'use client'
import { PaymentMethod } from "@/actions/accounting/paymentMethods/getAll";
import CreditCard, { CreditCardTypes } from "./CreditCard";
import BankTransfer from "./BankTransfer";
import BankCheck from "./BankCheck";

const PaymentMethodDisplay = ({ method, onClick }: { method: PaymentMethod, onClick?: (method: PaymentMethod) => void; }) => {
    const type = method.paymentType;

    const handleClick = () => {
        if (!onClick) {
            return;
        }
        onClick(method)
    };

    if (type === 'visa' || type === 'mastercard' || type === 'amex') {
        return (
            <div
                className="flex items-center justify-center cursor-pointer"
                onClick={handleClick}
            >
                <CreditCard
                    key={method.id}
                    cardName={method.methodName}
                    nameOnCard={method.associatedName}
                    endingIn={method.accountEndingIn || ''}
                    expiry={method.expiry || ''}
                    type={method.paymentType as CreditCardTypes}
                    bgColorA={method.bgColorA} bgColorB={method.bgColorB}
                    circleColorA={method.circleColorA || ''} circleColorB={method.circleColorB || ''}
                />
            </div>
        )
    }

    if (type === 'bankTransfer') {
        return (
            <div
                className="flex items-center justify-center cursor-pointer"
                onClick={handleClick}
            >
                <BankTransfer
                    key={method.id}
                    methodName={method.methodName}
                    bgColorA={method.bgColorA} bgColorB={method.bgColorB}
                    circleColorA={method.circleColorA || ''} circleColorB={method.circleColorB || ''}
                />
            </div>
        )
    }

    if (type === 'check') {
        return (
            <div
                className="flex items-center justify-center col-span-2 cursor-pointer"
                onClick={handleClick}
            >
                <BankCheck
                    methodName={method.methodName}
                    nameOnAccount={method.associatedName}
                    endingIn={method.accountEndingIn || ''}
                    bgColorA={method.bgColorA} bgColorB={method.bgColorB}
                    circleColorA={method.circleColorA || ''} circleColorB={method.circleColorB || ''}
                />
            </div>
        )
    }

    // Return null if the payment type is not recognized
    return null;
}

export default PaymentMethodDisplay;
