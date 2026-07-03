import { GuideSection } from "../../types";
import Overview from "./Overview";
import CreatingOrders from "./CreatingOrders";

export const purchaseOrderBoardSection: GuideSection = {
  id: "purchase-orders",
  title: "Purchase orders",
  overview: Overview,
  guides: [
    {
      title: "Creating a purchase order",
      description: "The two ways to start an order, both opening as a Draft.",
      content: CreatingOrders,
    },
  ],
};
