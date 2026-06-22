import SectionTitle from "@/components/Text/SectionTitle";

const ItemTypes = () => {
  return (
    <div className="flex flex-col gap-4 font-poppins text-base-content">
      <p className="text-lg">
        An item&apos;s type determines how it moves through the system — whether
        it can be purchased, produced, or both — and which modules it appears in.
      </p>

      <SectionTitle size="small">Common types</SectionTitle>
      <ul className="list-disc list-inside flex flex-col gap-2">
        <li>
          <span className="font-semibold">Purchased</span> — sourced from a
          supplier and received into inventory.
        </li>
        <li>
          <span className="font-semibold">Manufactured</span> — produced
          in-house from other items via a batch record.
        </li>
        <li>
          <span className="font-semibold">Both</span> — can be purchased or
          produced depending on need.
        </li>
      </ul>

      <p className="text-lg">
        Choose the type carefully when creating an item — it shapes the
        purchasing, production, and quality workflows available later.
      </p>
    </div>
  );
};

export default ItemTypes;
