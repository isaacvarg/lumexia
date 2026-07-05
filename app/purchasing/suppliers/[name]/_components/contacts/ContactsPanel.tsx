"use client";

import Card from "@/components/Card";
import React, { useMemo } from "react";
import ContactsAddNewForm from "./ContactsAddNewForm";
import ContactNote from "./ContactNote";
import AddContactNote from "./AddContactNote";
import EditContactForm from "./EditContactForm";
import { useSupplierDetailSelection, useSupplierDetailActions } from "@/store/supplierDetailSlice";
import Text from "@/components/Text";
import SectionTitle from "@/components/Text/SectionTitle";
import useDialog from "@/hooks/useDialog";
import { TbEdit, TbMail, TbPhone, TbPlus, TbTag } from "react-icons/tb";
import Layout from "@/components/Layout";

const ContactsPanel = () => {
  const { contacts, supplier, selectedContact } = useSupplierDetailSelection();
  const { setSelectedContact } = useSupplierDetailActions();
  const { showDialog } = useDialog();

  const activeContact = useMemo(() => {
    if (selectedContact) return selectedContact;
    if (contacts.length > 0) return contacts[0];
    return null;
  }, [selectedContact, contacts]);

  if (!supplier) return null;

  return (
    <div className="flex flex-col gap-6">
      <ContactsAddNewForm supplierId={supplier.id} />

      <div className="flex justify-between items-center">
        <SectionTitle>Contacts</SectionTitle>
        <button className="btn btn-secondary btn-outline" onClick={() => showDialog("addNewContact")}>
          <TbPlus className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact list - 1/3 */}
        <div className="col-span-1">
          <Card.Root>
            <div className="flex flex-col gap-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`flex flex-col gap-y-1 rounded-lg px-4 py-3 cursor-pointer transition-colors border-2 ${
                    activeContact?.id === contact.id
                      ? "bg-cararra-100 border-cararra-300"
                      : "border-transparent hover:bg-cararra-50"
                  }`}
                >
                  <h2 className="font-semibold text-lg">
                    {contact.firstName} {contact.lastName}
                  </h2>
                  {contact.type && (
                    <p className="text-sm text-neutral-500">{contact.type}</p>
                  )}
                </div>
              ))}
            </div>
          </Card.Root>
        </div>

        {/* Contact detail - 2/3 */}
        <div className="col-span-1 sm:col-span-2">
          {activeContact ? (
            <Card.Root>
              <EditContactForm contact={activeContact} />
              <AddContactNote contact={activeContact} />

              <div className="flex flex-col gap-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="font-semibold text-2xl">
                    {activeContact.firstName} {activeContact.lastName}
                  </h1>
                  <button className="btn btn-secondary btn-outline" onClick={() => showDialog(`editContact${activeContact.id}`)}>
                    <TbEdit className="size-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-y-2">
                  {activeContact.type && (
                    <Text.LabelDataPair data={activeContact.type}>
                      <Layout.Row>
                        <TbTag className="text-xl" />
                        Role
                      </Layout.Row>
                    </Text.LabelDataPair>
                  )}
                  {activeContact.phone && (
                    <Text.LabelDataPair data={activeContact.phone}>
                      <Layout.Row>
                        <TbPhone className="text-xl" />
                        Phone
                      </Layout.Row>
                    </Text.LabelDataPair>
                  )}
                  {activeContact.email && (
                    <Text.LabelDataPair data={activeContact.email}>
                      <Layout.Row>
                        <TbMail className="text-xl" />
                        Email
                      </Layout.Row>
                    </Text.LabelDataPair>
                  )}
                </div>

                <div className="flex flex-col gap-y-2">
                  <div className="flex justify-between items-center">
                    <SectionTitle>Notes</SectionTitle>
                    <button className="btn btn-secondary btn-outline" onClick={() => showDialog(`addContactNote${activeContact.id}`)}>
                      <TbPlus className="size-4" />
                    </button>
                  </div>

                  <div className="flex flex-col">
                    {activeContact.supplierContactNotes &&
                      activeContact.supplierContactNotes.map((note) => (
                        <ContactNote key={note.id} note={note} supplierId={supplier.id} />
                      ))}
                    {(!activeContact.supplierContactNotes || activeContact.supplierContactNotes.length === 0) && (
                      <p className="text-neutral-400 text-sm">No notes yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </Card.Root>
          ) : (
            <Card.Root>
              <div className="flex items-center justify-center h-full text-neutral-400">
                No contacts yet.
              </div>
            </Card.Root>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsPanel;
