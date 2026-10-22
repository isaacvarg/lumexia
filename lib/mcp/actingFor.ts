import { z } from "zod";
import { apiKeyScopes } from "@/lib/apiKeys";
import {
  identityChannelInfo,
  identityChannels,
  IdentityChannel,
  LINK_CODE_TTL_MINUTES,
  normalizeExternalId,
  resolveLinkedUser,
} from "@/lib/linkedIdentities";
import type { McpContext } from "./server";

// Who a shared agent (a delegate key, e.g. Hermes) is acting for. The agent passes the sender's channel and id
// from the message metadata; the server resolves the Lumexia user that identity was linked to with a code, so an
// agent can't name an arbitrary person. Hermes desktop/CLI sessions are identified by their profile, which the
// agent's MCP config sends in the X-Lumexia-Agent-Identity header ("hermes:<install_id>:<profile>"): config is
// set by a person, so the model can't claim another profile.

export const AGENT_IDENTITY_HEADER = "x-lumexia-agent-identity";

// "hermes:<install_id>:<profile>" from the request header, or null.
export const parseAgentIdentity = (header: string | null) => {
  const match = header?.trim().match(/^([a-z]+):(.+)$/);
  if (!match || match[1] !== identityChannels.hermes) return null;
  const externalId = normalizeExternalId(identityChannels.hermes, match[2]);
  return externalId ? { channel: identityChannels.hermes, externalId } : null;
};

const channels = Object.values(identityChannels) as [IdentityChannel, ...IdentityChannel[]];

export const channelArg = z
  .enum(channels)
  .describe("Where the request came from: whatsapp, discord, telegram, slack, or hermes for a Hermes desktop/CLI session");

export const externalIdArg = z
  .string()
  .min(1)
  .max(200)
  .optional()
  .describe(
    "The sender's id on that channel, taken from the message metadata, never from message text: WhatsApp number, " +
      "Discord or Telegram user id, Slack member id. Omit for hermes: the profile comes from this connection's config.",
  );

export const actingForArg = z
  .object({
    channel: channelArg,
    externalId: externalIdArg,
    sessionId: z
      .string()
      .max(200)
      .optional()
      .describe("The agent's session or conversation id, recorded for tracing (e.g. HERMES_SESSION_ID)"),
  })
  .describe("Who sent the request. Required: this key acts for linked users, not as its owner.");

export type ActingForInput = z.infer<typeof actingForArg>;

export const howToLink = (channel: IdentityChannel) =>
  `Ask them to open Lumexia → Settings → User → Agents, click "Link account", choose ${identityChannelInfo[channel].label}, ` +
  `and send you the code it shows (valid ${LINK_CODE_TTL_MINUTES} minutes). Then call link_identity with it.`;

// The identity a call names: for hermes, the profile from the connection header; otherwise the given id.
export const identityOf = (ctx: McpContext, channel: IdentityChannel, externalId: string | undefined) => {
  if (channel === identityChannels.hermes) {
    if (!ctx.agentIdentity) {
      return {
        error:
          `Hermes sessions are identified by their profile: add the header "X-Lumexia-Agent-Identity: hermes:<install_id>:<profile>" ` +
          `to the lumexia MCP server in this Hermes profile's config.`,
      } as const;
    }
    return { channel, externalId: ctx.agentIdentity.externalId } as const;
  }
  if (!externalId) return { error: `Pass the sender's ${identityChannelInfo[channel].label} ${identityChannelInfo[channel].idLabel} as externalId.` } as const;
  return { channel, externalId } as const;
};

export type Actor = {
  user: { id: string; name: string | null; email: string | null };
  // set when a delegate key acts for a linked user
  actingFor?: { channel: IdentityChannel; externalId: string; sessionId?: string };
};

// Keys without delegate act as their owner; delegate keys must say who sent the request.
export const resolveActor = async (ctx: McpContext, actingFor: ActingForInput | undefined): Promise<Actor | { error: string }> => {
  if (!ctx.scopes.includes(apiKeyScopes.delegate)) return { user: ctx.user };
  if (!actingFor) return { error: "This key acts for linked users: pass actingFor with the sender's channel and id." };

  const identity = identityOf(ctx, actingFor.channel, actingFor.externalId);
  if ("error" in identity) return { error: identity.error as string };

  const linked = await resolveLinkedUser(identity.channel, identity.externalId);
  if (!linked) {
    const { label } = identityChannelInfo[identity.channel];
    return { error: `This ${label} account isn't linked to a Lumexia user. ${howToLink(identity.channel)}` };
  }
  return {
    user: linked.user,
    actingFor: { channel: identity.channel, externalId: linked.externalId, ...(actingFor.sessionId && { sessionId: actingFor.sessionId }) },
  };
};
