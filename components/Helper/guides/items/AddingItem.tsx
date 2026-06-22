import SectionTitle from "@/components/Text/SectionTitle";

const AddingItem = () => {
  return (
    <div className="flex flex-col gap-4 font-poppins text-base-content">
      <p className="text-lg">
        Items are the building blocks of inventory. Creating one registers a new
        material, component, or product that the rest of the system can track,
        purchase, and produce.
      </p>

      <SectionTitle size="small">Steps</SectionTitle>
      <ol className="list-decimal list-inside flex flex-col gap-2">
        <li>Open the Items page and select &quot;Create Item&quot;.</li>
        <li>Give the item a clear, unique name.</li>
        <li>Choose its type — this controls how it behaves downstream.</li>
        <li>Save. The item is now available across inventory and purchasing.</li>
      </ol>

      <SectionTitle size="small">Tips</SectionTitle>
      <ul className="list-disc list-inside flex flex-col gap-2">
        <li>Use consistent naming so items are easy to search.</li>
        <li>Set up aliases for materials that go by more than one name.</li>
      </ul>
    </div>
  );
};

export default AddingItem;
