import { GuideSection } from "../../types";
import Overview from "./Overview";
import PaymentMethods from "./PaymentMethods";
import MethodPurchases from "./MethodPurchases";

export const accountingPaymentsSection: GuideSection = {
  id: "accounting-payments",
  title: "Payments",
  overview: Overview,
  guides: [
    {
      title: "Payment methods",
      description: "The method catalog, its fields, and adding/editing one.",
      content: PaymentMethods,
    },
    {
      title: "A method's purchases",
      description: "The purchases table on a method's detail page.",
      content: MethodPurchases,
    },
  ],
};
