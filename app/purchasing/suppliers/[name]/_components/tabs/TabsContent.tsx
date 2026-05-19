"use client";

import { Tabs } from "@/components/Tabs2";
import PurchasesTab from "../purchases/PurchasesTab";
import ItemsTab from "../items/ItemsTab";
import ContactsPanel from "../contacts/ContactsPanel";
import NotesTable from "../notes/NotesTable";
import AliasesTab from "../aliases/AliasesTab";
import SettingsTab from "../settings/SettingsTab";
import { useSupplierDetailSelection } from "@/store/supplierDetailSlice";

const TabsContent = () => {
  const { supplier, purchases, items, contacts, notes } = useSupplierDetailSelection();

  if (!supplier) return null;

  return (
    <Tabs.Root defaultValue="purchases">
      <Tabs.List>
        <Tabs.Trigger size="large" value="purchases">Purchases</Tabs.Trigger>
        <Tabs.Trigger size="large" value="contacts">Contacts</Tabs.Trigger>
        <Tabs.Trigger size="large" value="notes">Notes</Tabs.Trigger>
        <Tabs.Trigger size="large" value="items">Items</Tabs.Trigger>
        <Tabs.Trigger size="large" value="aliases">Aliases</Tabs.Trigger>
        <Tabs.Trigger size="large" value="settings">Settings</Tabs.Trigger>
      </Tabs.List>

      <Tabs.ContentContainer>
        <Tabs.Content value="purchases">
          <PurchasesTab />
        </Tabs.Content>

        <Tabs.Content value="contacts">
          <ContactsPanel />
        </Tabs.Content>

        <Tabs.Content value="notes">
          <NotesTable />
        </Tabs.Content>

        <Tabs.Content value="items">
          <ItemsTab />
        </Tabs.Content>

        <Tabs.Content value="aliases">
          <AliasesTab />
        </Tabs.Content>

        <Tabs.Content value="settings">
          <SettingsTab />
        </Tabs.Content>
      </Tabs.ContentContainer>
    </Tabs.Root>
  );
};

export default TabsContent;
