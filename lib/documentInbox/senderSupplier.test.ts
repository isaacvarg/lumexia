import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { emailDomain, matchSupplierByDomain } from "./senderSupplier";

describe("sender supplier", () => {
  it("reads the domain from plain and display-name addresses", () => {
    assert.equal(emailDomain("QC@Acme-Chem.com"), "acme-chem.com");
    assert.equal(emailDomain("Jane Doe <jane@acme-chem.com>"), "acme-chem.com");
    assert.equal(emailDomain("not an email"), null);
  });

  it("ignores free mail domains", () => {
    assert.equal(emailDomain("someone@gmail.com"), null);
    assert.equal(matchSupplierByDomain("someone@gmail.com", [{ supplierId: "a", email: "x@gmail.com" }]), null);
  });

  it("matches the one supplier whose contacts share the domain", () => {
    const contacts = [
      { supplierId: "acme", email: "sales@acme-chem.com" },
      { supplierId: "acme", email: "qc@acme-chem.com" },
      { supplierId: "other", email: "hi@other.com" },
      { supplierId: "none", email: null },
    ];
    assert.equal(matchSupplierByDomain("docs@acme-chem.com", contacts), "acme");
    assert.equal(matchSupplierByDomain("docs@unknown.com", contacts), null);
  });

  it("doesn't guess when several suppliers share a domain", () => {
    const contacts = [
      { supplierId: "a", email: "x@distributor.com" },
      { supplierId: "b", email: "y@distributor.com" },
    ];
    assert.equal(matchSupplierByDomain("z@distributor.com", contacts), null);
  });
});
