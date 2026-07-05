"use client"

import { useEffect, useState } from "react"
import { getMbprs } from "../../_functions/getMbprs"
import useProductionWizard from "@/hooks/useProductionWizard";
import Card from "@/components/Card";
import MbprCard from "./MbprCard";
import { MasterBatchProductionRecord } from "@/types/masterBatchProductionRecord";
import Layout from "@/components/Layout";
import ActionButton from "@/components/ActionButton";
import useDialog from "@/hooks/useDialog";
import MbprForm from "./MbprForm";


const Step2 = () => {
  const [mbprs, setMbprs] = useState([]);
  const { selectedProducibleMaterial , revalidateTrigger} = useProductionWizard()
  const { showDialog } = useDialog()

  useEffect(() => {

    const getData = async () => {
      if (!selectedProducibleMaterial) { return }
      const mbprs = await getMbprs(selectedProducibleMaterial?.id);

      setMbprs(mbprs);
    }

    getData()
  }, [selectedProducibleMaterial, revalidateTrigger])

  return (
    <Card.Root>
      <MbprForm mode="create" />

      <Layout.Row>
        <Card.Title>Master Batch Production Records</Card.Title>
        <ActionButton onClick={() => showDialog('mbprNew')}>New</ActionButton>
      </Layout.Row>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {mbprs.map((mbpr: MasterBatchProductionRecord) => <MbprCard key={mbpr.id} mbpr={mbpr} />)}
      </div>
    </Card.Root>
  )
}

export default Step2
