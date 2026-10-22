// The chat channels a Lumexia user can link an identity on. No server imports: settings pages use this too.

export const identityChannels = {
  whatsapp: "whatsapp",
  discord: "discord",
  telegram: "telegram",
  slack: "slack",
  // a Hermes profile on one machine (desktop/CLI sessions): "<install_id>:<profile>"
  hermes: "hermes",
} as const;

export type IdentityChannel = (typeof identityChannels)[keyof typeof identityChannels];

export const isIdentityChannel = (value: string): value is IdentityChannel =>
  (Object.values(identityChannels) as string[]).includes(value);

// How each channel is shown, and what its id is called, in settings and in agent instructions.
export const identityChannelInfo: Record<IdentityChannel, { label: string; idLabel: string }> = {
  whatsapp: { label: "WhatsApp", idLabel: "number" },
  discord: { label: "Discord", idLabel: "user id" },
  telegram: { label: "Telegram", idLabel: "user id" },
  slack: { label: "Slack", idLabel: "member id" },
  hermes: { label: "Hermes", idLabel: "profile" },
};

// How an id is displayed: WhatsApp numbers get their +.
export const formatExternalId = (channel: string, externalId: string) =>
  channel === identityChannels.whatsapp ? `+${externalId}` : externalId;
