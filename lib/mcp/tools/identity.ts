import prisma from "@/lib/prisma";
import { identityChannelInfo, redeemLinkCode, resolveLinkedUser, unlinkByExternalId } from "@/lib/linkedIdentities";
import { z } from "zod";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { channelArg, externalIdArg, howToLink, identityOf } from "../actingFor";

// Linking chat identities (WhatsApp, Discord, Telegram, Slack, Hermes profiles) to Lumexia users, for keys
// that act for linked users. One user may link many identities; each identity belongs to one user.
export const registerIdentityTools: ToolRegistrar = (server, ctx) => {
  server.registerTool(
    "identify_sender",
    {
      title: "Identify sender",
      description:
        "Which Lumexia user a chat identity is linked to. Call it before acting for someone you haven't identified " +
        "in this conversation; if they aren't linked, it says how they can link.",
      inputSchema: { channel: channelArg, externalId: externalIdArg },
      annotations: { readOnlyHint: true },
    },
    async ({ channel, externalId }) => {
      const identity = identityOf(ctx, channel, externalId);
      if ("error" in identity) return errorResult(identity.error as string);

      const linked = await resolveLinkedUser(identity.channel, identity.externalId);
      if (!linked) return jsonResult({ linked: false, channel, howToLink: howToLink(channel) });
      return jsonResult({ linked: true, channel, user: linked.user, linkedAt: linked.linkedAt });
    },
  );

  server.registerTool(
    "link_identity",
    {
      title: "Link identity",
      description:
        "Link the sender's chat identity to their Lumexia account with the one-time code they created in Lumexia " +
        "(Settings → User → Agents → Link account). Only use a code the sender sent you themselves, from the identity " +
        "being linked. If that identity was linked to someone else, it moves to the code's owner.",
      inputSchema: {
        channel: channelArg,
        externalId: externalIdArg,
        code: z.string().min(4).max(20).describe("The code they sent, e.g. K7Q2-M9XD"),
      },
    },
    async ({ channel, externalId, code }) => {
      const identity = identityOf(ctx, channel, externalId);
      if ("error" in identity) return errorResult(identity.error as string);

      const result = await redeemLinkCode({ code, channel: identity.channel, externalId: identity.externalId, apiKeyId: ctx.keyId });
      if ("error" in result) return errorResult(result.error as string);

      await prisma.activityLog.create({
        data: {
          userId: result.user.id,
          action: "linked chat identity",
          entityType: "user",
          entityId: result.user.id,
          details: { via: "mcp", apiKeyId: ctx.keyId, channel, externalId: result.externalId },
        },
      });

      return jsonResult({ linked: true, channel, channelLabel: identityChannelInfo[channel].label, user: result.user });
    },
  );

  server.registerTool(
    "unlink_identity",
    {
      title: "Unlink identity",
      description: "Unlink the sender's chat identity from their Lumexia account, when they ask to.",
      inputSchema: { channel: channelArg, externalId: externalIdArg },
    },
    async ({ channel, externalId }) => {
      const identity = identityOf(ctx, channel, externalId);
      if ("error" in identity) return errorResult(identity.error as string);

      const linked = await resolveLinkedUser(identity.channel, identity.externalId);
      const count = await unlinkByExternalId(identity.channel, identity.externalId);
      if (count === 0) return errorResult("That identity isn't linked.");

      if (linked) {
        await prisma.activityLog.create({
          data: {
            userId: linked.user.id,
            action: "unlinked chat identity",
            entityType: "user",
            entityId: linked.user.id,
            details: { via: "mcp", apiKeyId: ctx.keyId, channel, externalId: linked.externalId },
          },
        });
      }
      return jsonResult({ unlinked: true });
    },
  );
};
