import React from "react";
import { purchasingActions } from "@/actions/purchasing";
import { Tabs } from "@/components/Tabs2";
import AwaitingDeliveryTable from "./_components/AwaitingDeliveryTable";
import ReceivedTable from "./_components/ReceivedTable";
import HelperSetter from "@/components/Helper/HelperSetter";

const ReceivingPage = async () => {
  const purchaseOrders = await purchasingActions.purchaseOrders.getAll();

  return (
    <div className="flex flex-col gap-y-6">

      <HelperSetter section="receiving" />

      <Tabs.Root defaultValue="awaiting">
        <div className="flex justify-between items-center">
          <Tabs.List>
            <Tabs.Trigger value="awaiting">Awaiting</Tabs.Trigger>
            <Tabs.Trigger value="received">Received</Tabs.Trigger>
          </Tabs.List>

        </div>

        <div className="pt-4">
          <Tabs.ContentContainer>
            <Tabs.Content value="awaiting">
              <AwaitingDeliveryTable purchaseOrders={purchaseOrders} />
            </Tabs.Content>
            <Tabs.Content value="received">
              <ReceivedTable purchaseOrders={purchaseOrders} />
            </Tabs.Content>

          </Tabs.ContentContainer>
        </div>


      </Tabs.Root>
    </div>
  );
};

export default ReceivingPage;
