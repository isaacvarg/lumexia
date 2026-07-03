import supplierActions from "@/actions/purchasing/supplierActions";
import PageTitle from "@/components/Text/PageTitle";
import React from "react";
import Table from "./_components/Table";
import CreateSupplierForm from "./_components/CreateSupplierForm";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import HelperSetter from "@/components/Helper/HelperSetter";

const SuppliersPage = async () => {
  const suppliers = await supplierActions.getAll({
    recordStatusId: { not: recordStatuses.archived },
  } as any);

  return (
    <div className="flex flex-col gap-y-6">
      <HelperSetter section="suppliers" />

      <PageTitle title="Suppliers" />

      <CreateSupplierForm />

      <Table suppliers={suppliers} />
    </div>
  );
};

export default SuppliersPage;
