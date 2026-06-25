import ArchiveSupplierButton from "./ArchiveSupplierButton";
import SupplierDetailsCard from "./SupplierDetailsCard";

const SettingsTab = () => {
  return (
    <div className="flex flex-col gap-6">
      <SupplierDetailsCard />
      <ArchiveSupplierButton />
    </div>
  );
};

export default SettingsTab;
