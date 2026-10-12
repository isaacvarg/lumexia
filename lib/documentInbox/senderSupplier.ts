import { Db } from "@/lib/canon/db";

// Works out which supplier sent a message from the sender's email domain, using supplier contacts.
// Free mail domains say nothing about the company, so they never match.

const freeMailDomains = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

export const emailDomain = (email: string | null | undefined) => {
  const domain = email?.trim().toLowerCase().match(/@([^@\s>]+)>?$/)?.[1];
  return domain && !freeMailDomains.has(domain) ? domain : null;
};

// The one supplier whose contacts use the sender's domain; none when no supplier or several do.
export const matchSupplierByDomain = (
  senderEmail: string | null | undefined,
  contacts: { supplierId: string; email: string | null }[],
) => {
  const domain = emailDomain(senderEmail);
  if (!domain) return null;
  const suppliers = new Set(contacts.filter((c) => emailDomain(c.email) === domain).map((c) => c.supplierId));
  return suppliers.size === 1 ? Array.from(suppliers)[0] : null;
};

export const findSenderSupplier = async (db: Db, senderEmail: string | null | undefined) => {
  const domain = emailDomain(senderEmail);
  if (!domain) return null;
  const contacts = await db.supplierContact.findMany({
    where: { email: { endsWith: `@${domain}`, mode: "insensitive" } },
    select: { supplierId: true, email: true },
  });
  return matchSupplierByDomain(senderEmail, contacts);
};
