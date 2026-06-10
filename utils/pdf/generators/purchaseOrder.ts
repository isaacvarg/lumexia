import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getImageDimensions } from "../functions/getImageDimensions";

// assets & data
import "../assets/fonts/Lato-Black-normal";
import "../assets/fonts/Lato-Regular-normal";
import "../assets/fonts/Lato-Bold-normal";
import { PurchaseOrderItem } from "@/types/purchaseOrderItem";
import { getAutoTableEnd } from "../functions/getAutoTableEnd";
import { DateTime } from "luxon";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";
import { FlattenedOrderItem } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_functions/flattenOrderItems";
import { getCompanyPdfImages } from "@/actions/app/images/getCompanyPdfImages";
import { PoSupplierNote } from "@/actions/purchasing/purchaseOrders/notes/supplier/getAll";
import { PoPublicNote } from "@/actions/purchasing/purchaseOrders/notes/public/getAll";
import { createConfigLookup } from "@/utils/data/createConfigLookup";
import { Config, Supplier } from "@prisma/client";


const calculateGrandTotal = (items: PurchaseOrderItem[]) => {
  return items.reduce((total, item) => {
    return total + item.quantity * item.pricePerUnit;
  }, 0);
};



export const createPurchaseOrder = async (
  poNumber: number,
  timestamp: Date,
  supplier: Supplier,
  poItems: FlattenedOrderItem[],
  companyData: Config[],
  publicNotes: PoPublicNote[],
  poSupplierNotes: PoSupplierNote[]
) => {
  // data
  const { logo } = await getCompanyPdfImages();
  const logoDimensions = logo ? await getImageDimensions(logo) : null;


  const companyLookup = createConfigLookup(companyData);

  const company = {
    logo,
    name: companyLookup['name'],
    address: {
      street1: companyLookup['addressStreet1'],
      street2: companyLookup['addressStreet2'],
      city: companyLookup['addressCity'],
      state: companyLookup['addressState'],
      zipcode: companyLookup['addressZipcode']
    },
    phone: companyLookup['phone'],
    email: companyLookup['email'],
    mainContacts: {
      purchasing: {
        firstName: companyLookup['purchasingContactFirstName'],
        lastName: companyLookup['purchasingContactLastName'],
        email: companyLookup['purchasingContactEmail'],
      },
    },


  }
  const logoResizeFactor = 0.3;
  const total = calculateGrandTotal(poItems);

  const pdf = new jsPDF({
    orientation: "p",
    format: "letter",
    unit: "px",
  });

  let tableItems: any[] = [];
  poItems.forEach((item: FlattenedOrderItem) => {


    const itemName = item.alias ? item.alias : item.item.name;

    tableItems.push([
      itemName,
      item.quantity,
      toFracitonalDigits.curreny(item.pricePerUnit),
      item.uom.abbreviation,
      toFracitonalDigits.curreny(item.quantity * item.pricePerUnit),
    ]);
  });

  // Header Image
  if (company.logo && logoDimensions) {
    pdf.addImage(
      company.logo,
      30,
      20,
      logoDimensions.width * logoResizeFactor,
      logoDimensions.height * logoResizeFactor
    );
  }

  // PO Basic Info
  pdf
    .setFontSize(24)
    .setFont("Lato-Black", "normal", "normal")
    .setTextColor("#333333");
  pdf.text("Purchase Order #", 30, 100);
  pdf.text(poNumber.toString(), 265, 100);

  pdf.setFontSize(10).setFont("Lato-Regular", "normal", "normal");
  pdf.text("Date Submitted: " + DateTime.fromJSDate(timestamp).toFormat("DD"), 30, 110);

  // Our Company Info
  pdf
    .setFontSize(12)
    .setFont("Lato-Bold", "normal", "normal")
    .setTextColor("#434343");
  pdf.text("Shipping Address", 30, 140);
  pdf.setFont("Lato-Regular", "normal", "normal").setFontSize(10);
  pdf.text(
    [
      `${company.mainContacts.purchasing.firstName} ${company.mainContacts.purchasing.lastName}`,
      company.name,
      `${company.address.street1} ${company.address.street2}`,
      `${company.address.city}, ${company.address.state} ${company.address.zipcode}`,
    ],
    30,
    152
  );

  // Submitted To
  pdf
    .setFontSize(12)
    .setFont("Lato-Bold", "normal", "normal")
    .setTextColor("#434343");
  pdf.text("Submitted To", 265, 140);
  pdf.setFont("Lato-Regular", "normal", "normal").setFontSize(10);
  pdf.text(["Sales", supplier.name], 265, 152);

  // items table
  autoTable(pdf, {
    startY: 190,
    headStyles: { fillColor: "#333333", fontSize: 12 },
    head: [["Product", "Quantity", "Unit Price", "UOM", "Total"]],
    body: tableItems,
  });

  // end of table
  const autoTableEnd = getAutoTableEnd(pdf);

  // footer notes
  pdf
    .setFontSize(12)
    .setFont("Lato-Bold", "normal", "normal")
    .setTextColor("#434343");
  pdf.text("Notes", 30, autoTableEnd + 30);
  pdf.setFont("Lato-Regular", "normal", "normal").setFontSize(10);

  const notes = ['Receiving Hours: Monday - Thurdsday: 8:00 a.m. - 4:00 p.m. PST.', 'Closed Friday through Sunday and all major holidays.'];
  if (publicNotes.length > 0) {
    notes.push(...publicNotes.map(note => note.content));
  }
  if (poSupplierNotes.length > 0) {
    notes.push(...poSupplierNotes.map(note => note.content));
  }
  pdf.text(pdf.splitTextToSize(notes.join('\n\n'), 200), 30, autoTableEnd + 42);

  // total area
  pdf
    .setFontSize(11)
    .setFont("Lato-Bold", "normal", "normal")
    .setTextColor("#434343");
  pdf.text("Subtotal", 265, autoTableEnd + 30);
  pdf.text("Taxes", 265, autoTableEnd + 42);
  pdf.text("Total", 265, autoTableEnd + 54);

  pdf
    .setFontSize(11)
    .setFont("Lato-Regular", "normal", "normal")
    .setTextColor("#434343");
  pdf.text("$ " + toFracitonalDigits.curreny(total), 330, autoTableEnd + 30);
  pdf.text("$ 0.000", 330, autoTableEnd + 42);
  pdf.text("$ " + toFracitonalDigits.curreny(total), 330, autoTableEnd + 54);

  pdf.setDrawColor("#E3E3E3");
  pdf.setLineWidth(0.5);
  pdf.line(30, 560, 425, 560);
  pdf.setFont("Lato-Regular", "normal", "normal").setFontSize(8);
  pdf.text(
    `${company.phone}           ${company.mainContacts.purchasing.email}`,
    180,
    572
  );
  pdf.line(30, 580, 425, 580);

  pdf.save(`PO #${poNumber}`);
};
