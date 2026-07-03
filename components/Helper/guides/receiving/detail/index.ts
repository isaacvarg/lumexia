import { GuideSection } from "../../types";
import Overview from "./Overview";
import ReceivingItems from "./ReceivingItems";
import UnitsAndConversions from "./UnitsAndConversions";
import LotsCreated from "./LotsCreated";
import PrintingLabels from "./PrintingLabels";

export const receivingDetailSection: GuideSection = {
  id: "receiving-detail",
  title: "Receiving an order",
  overview: Overview,
  guides: [
    {
      title: "Receiving items",
      description: "Fully or partially receiving lines, and what the order does.",
      content: ReceivingItems,
    },
    {
      title: "Units & conversions",
      description: "Converting the purchase unit into the item's inventory UOM.",
      content: UnitsAndConversions,
    },
    {
      title: "Lots created",
      description: "The lot each received line mints, and what it carries.",
      content: LotsCreated,
    },
    {
      title: "Printing labels",
      description: "QR labels for received lots — printing, contents, reprinting.",
      content: PrintingLabels,
    },
  ],
};
