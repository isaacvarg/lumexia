'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbPlus, TbTrash, TbUsersGroup, TbX } from "react-icons/tb"
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import useToast from "@/hooks/useToast"
import { canonActions } from "@/actions/canon"
import { CanonTeamRow, CanonUserOption } from "../types"

const TeamCard = ({ team, users }: { team: CanonTeamRow; users: CanonUserOption[] }) => {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const memberIds = new Set(team.members.map((m) => m.userId))

  const addMember = async () => {
    if (!userId) return
    await canonActions.teams.addMember(team.id, userId)
    setUserId("")
    router.refresh()
  }

  const removeMember = async (memberUserId: string) => {
    await canonActions.teams.removeMember(team.id, memberUserId)
    router.refresh()
  }

  const deleteTeam = async () => {
    if (!confirm(`Delete ${team.name}? Its members lose any edit or review rights granted through it.`)) return
    await canonActions.teams.delete(team.id)
    router.refresh()
  }

  return (
    <Card.Root>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <TbUsersGroup className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{team.name}</h3>
            {team.description && <p className="text-sm text-base-content/60">{team.description}</p>}
          </div>
        </div>
        <button onClick={deleteTeam} className="btn btn-error btn-soft btn-sm" aria-label={`Delete ${team.name}`}>
          <TbTrash className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {team.members.length === 0 && <span className="text-sm italic text-base-content/50">No members yet</span>}
        {team.members.map((m) => (
          <span key={m.id} className="badge badge-lg badge-soft gap-1">
            {m.user.name ?? "Unnamed user"}
            <button onClick={() => removeMember(m.userId)} aria-label={`Remove ${m.user.name}`} className="opacity-60 hover:opacity-100">
              <TbX className="size-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <select className="select select-sm flex-1" value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Add a member…</option>
          {users.filter((u) => !memberIds.has(u.id)).map((u) => (
            <option key={u.id} value={u.id}>{u.name ?? "Unnamed user"}</option>
          ))}
        </select>
        <button onClick={addMember} disabled={!userId} className="btn btn-secondary btn-sm" aria-label="Add member">
          <TbPlus className="size-4" />
        </button>
      </div>
    </Card.Root>
  )
}

const Teams = ({ teams, users }: { teams: CanonTeamRow[]; users: CanonUserOption[] }) => {
  const router = useRouter()
  const { toast } = useToast()
  const [isAdd, setIsAdd] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const create = async () => {
    if (!name.trim()) return
    try {
      await canonActions.teams.create({ name, description })
      setName("")
      setDescription("")
      setIsAdd(false)
      router.refresh()
    } catch {
      toast('Could not create team', `A team named "${name}" may already exist.`, 'error')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Teams</SectionTitle>
        <button onClick={() => setIsAdd((v) => !v)} className="btn btn-secondary"><TbPlus className="size-4" /></button>
      </div>

      <p className="text-base-content/70">
        Groups of people you can make editors or reviewers of data types. Teams are separate from user roles.
      </p>

      {isAdd && (
        <Card.Root>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-medium">Name</span>
              <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Regulatory" />
            </label>
            <label className="flex flex-[2] flex-col gap-1">
              <span className="text-sm font-medium">Description</span>
              <input className="input w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <button onClick={create} className="btn btn-success">Create</button>
          </div>
        </Card.Root>
      )}

      {teams.length === 0 && !isAdd && (
        <p className="text-base-content/50 italic">No teams yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {teams.map((team) => <TeamCard key={team.id} team={team} users={users} />)}
      </div>
    </div>
  )
}

export default Teams
