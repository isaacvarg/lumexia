'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbAlertTriangle, TbPlus, TbRobot, TbUser, TbUsersGroup, TbX } from "react-icons/tb"
import { canonActions } from "@/actions/canon"
import { canonCapabilities } from "@/configs/staticRecords/canonCapabilities"
import { CanonDataTypeRow, CanonSettingsData } from "../types"
import Section from "./Section"

type Grantee = { id: string; kind: "user" | "team"; name: string; isAgent?: boolean }

const CapabilityList = ({
  title,
  hint,
  capabilityId,
  dataType,
  settings,
}: {
  title: string
  hint: string
  capabilityId: string
  dataType: CanonDataTypeRow
  settings: CanonSettingsData
}) => {
  const router = useRouter()
  const [choice, setChoice] = useState("")

  const grants: Grantee[] = [
    ...dataType.teamPermissions
      .filter((p) => p.capabilityId === capabilityId)
      .map((p) => ({ id: p.id, kind: "team" as const, name: p.team.name })),
    ...dataType.userPermissions
      .filter((p) => p.capabilityId === capabilityId)
      .map((p) => ({
        id: p.id,
        kind: "user" as const,
        name: p.user.name ?? "Unnamed user",
        isAgent: settings.users.some((u) => u.id === p.userId && u.isAgent),
      })),
  ]

  const grantedTeamIds = new Set(dataType.teamPermissions.filter((p) => p.capabilityId === capabilityId).map((p) => p.teamId))
  const grantedUserIds = new Set(dataType.userPermissions.filter((p) => p.capabilityId === capabilityId).map((p) => p.userId))

  const add = async () => {
    if (!choice) return
    const [kind, id] = choice.split(":")
    if (kind === "team") await canonActions.permissions.grantTeam({ dataTypeId: dataType.id, capabilityId, teamId: id })
    else await canonActions.permissions.grantUser({ dataTypeId: dataType.id, capabilityId, userId: id })
    setChoice("")
    router.refresh()
  }

  const remove = async (grant: Grantee) => {
    if (grant.kind === "team") await canonActions.permissions.revokeTeam(grant.id)
    else await canonActions.permissions.revokeUser(grant.id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-xs text-base-content/60">{hint}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {grants.length === 0 && <span className="text-sm italic text-base-content/50">Nobody yet</span>}
        {grants.map((g) => (
          <span key={g.id} className="badge badge-lg gap-1 badge-soft">
            {g.kind === "team" ? <TbUsersGroup className="size-4" /> : g.isAgent ? <TbRobot className="size-4" /> : <TbUser className="size-4" />}
            {g.name}
            <button onClick={() => remove(g)} aria-label={`Remove ${g.name}`} className="opacity-60 hover:opacity-100">
              <TbX className="size-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <select className="select select-sm flex-1" value={choice} onChange={(e) => setChoice(e.target.value)}>
          <option value="">Add a team or person…</option>
          <optgroup label="Teams">
            {settings.teams.filter((t) => !grantedTeamIds.has(t.id)).map((t) => (
              <option key={t.id} value={`team:${t.id}`}>{t.name} ({t.members.length})</option>
            ))}
          </optgroup>
          <optgroup label="People">
            {settings.users.filter((u) => !grantedUserIds.has(u.id)).map((u) => (
              <option key={u.id} value={`user:${u.id}`}>{u.name ?? "Unnamed user"}{u.isAgent ? " (agent)" : ""}</option>
            ))}
          </optgroup>
        </select>
        <button onClick={add} disabled={!choice} className="btn btn-sm btn-secondary" aria-label={`Add to ${title}`}>
          <TbPlus className="size-4" />
        </button>
      </div>
    </div>
  )
}

const PermissionsPanel = ({ dataType, settings }: { dataType: CanonDataTypeRow; settings: CanonSettingsData }) => {
  const isLinked = !!dataType.resolverKey
  const has = (capabilityId: string) =>
    [...dataType.userPermissions, ...dataType.teamPermissions].some((p) => p.capabilityId === capabilityId)
  // what's missing before anyone can put a value on an item
  const missing = [
    !isLinked && !has(canonCapabilities.edit) && "No editors yet, so nobody can add or change values.",
    !has(canonCapabilities.review) && (isLinked
      ? "No reviewers yet, so nobody can accept the Lumexia source value."
      : "No reviewers yet, so proposed changes can't be approved."),
  ].filter(Boolean) as string[]

  // agents propose; a reviewer that is also an agent could see its own proposals through
  const agentIds = new Set(settings.users.filter((u) => u.isAgent).map((u) => u.id))
  const agentReviewers = Array.from(new Set([
    ...dataType.userPermissions
      .filter((p) => p.capabilityId === canonCapabilities.review && agentIds.has(p.userId))
      .map((p) => p.user.name ?? "Unnamed user"),
    ...dataType.teamPermissions
      .filter((p) => p.capabilityId === canonCapabilities.review)
      .flatMap((p) => settings.teams.find((t) => t.id === p.teamId)?.members ?? [])
      .filter((m) => agentIds.has(m.userId))
      .map((m) => m.user.name ?? "Unnamed user"),
  ]))
  if (agentReviewers.length > 0) {
    missing.push(
      `${agentReviewers.join(", ")} ${agentReviewers.length === 1 ? "has" : "have"} an API key that proposes Canon changes. ` +
      `Agents should hold Edit only: as reviewers, their proposals are refused, and a misconfiguration could let them approve.`,
    )
  }

  return (
    <Section title="Permissions">
      <div className="flex flex-col gap-5">
        {missing.length > 0 && (
          <div role="alert" className="alert alert-warning alert-soft text-sm">
            <TbAlertTriangle className="size-5" />
            <div>{missing.map((m) => <div key={m}>{m}</div>)}</div>
          </div>
        )}
        <CapabilityList
          title="Editors"
          hint={isLinked
            ? "Can propose accepting the Lumexia source value; a reviewer still approves it."
            : "Can propose changes."}
          capabilityId={canonCapabilities.edit}
          dataType={dataType}
          settings={settings}
        />
        <CapabilityList
          title="Reviewers"
          hint={isLinked
            ? "Accept changes made at the Lumexia source. They own what this data means."
            : "Approve or reject proposed changes."}
          capabilityId={canonCapabilities.review}
          dataType={dataType}
          settings={settings}
        />
      </div>
    </Section>
  )
}

export default PermissionsPanel
