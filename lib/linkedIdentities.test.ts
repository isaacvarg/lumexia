import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeExternalId } from "./linkedIdentities";
import { parseAgentIdentity } from "./mcp/actingFor";

describe("normalizeExternalId", () => {
  it("keeps WhatsApp digits only", () => {
    assert.equal(normalizeExternalId("whatsapp", "+1 (555) 123-4567"), "15551234567");
    assert.equal(normalizeExternalId("whatsapp", "15551234567@s.whatsapp.net"), "15551234567");
    assert.equal(normalizeExternalId("whatsapp", "123"), null);
  });

  it("accepts Discord snowflakes and mentions", () => {
    assert.equal(normalizeExternalId("discord", "123456789012345678"), "123456789012345678");
    assert.equal(normalizeExternalId("discord", "<@!123456789012345678>"), "123456789012345678");
    assert.equal(normalizeExternalId("discord", "someone#1234"), null);
  });

  it("accepts numeric Telegram ids", () => {
    assert.equal(normalizeExternalId("telegram", " 987654321 "), "987654321");
    assert.equal(normalizeExternalId("telegram", "@handle"), null);
  });

  it("upper-cases Slack member ids, optionally team-qualified", () => {
    assert.equal(normalizeExternalId("slack", "u0123abcd"), "U0123ABCD");
    assert.equal(normalizeExternalId("slack", "T0123ABC:U0456DEF"), "T0123ABC:U0456DEF");
    assert.equal(normalizeExternalId("slack", "#general"), null);
  });

  it("takes a Hermes install id and profile", () => {
    assert.equal(normalizeExternalId("hermes", "0123456789ABCDEF0123456789abcdef:pikachu"), "0123456789abcdef0123456789abcdef:pikachu");
    assert.equal(normalizeExternalId("hermes", "pikachu"), null);
  });
});

describe("parseAgentIdentity", () => {
  it("reads the Hermes profile header", () => {
    assert.deepEqual(parseAgentIdentity("hermes:0123456789abcdef0123456789abcdef:los-amantes"), {
      channel: "hermes",
      externalId: "0123456789abcdef0123456789abcdef:los-amantes",
    });
  });

  it("ignores other channels and junk", () => {
    assert.equal(parseAgentIdentity("whatsapp:15551234567"), null);
    assert.equal(parseAgentIdentity("hermes:nope"), null);
    assert.equal(parseAgentIdentity(null), null);
  });
});
