'use client'
import { useMemo, useState } from "react"
import { TbLayoutList, TbPlus, TbSchema, TbSearch, TbX } from "react-icons/tb"
import { CanonSettingsData } from "./types"
import DataTypeCanvas from "./canvas/DataTypeCanvas"
import DataTypeList from "./list/DataTypeList"
import DataTypeDrawer from "./drawer/DataTypeDrawer"

type View = "canvas" | "list"
const VIEW_KEY = "canon-settings-view"

const readView = (): View => {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "canvas"
  } catch {
    return "canvas"
  }
}

// Data types tab: one toolbar (view, search, group filter, add) over the canvas or the list,
// and one editing drawer shared by both.
const DataTypesView = (props: CanonSettingsData) => {
  const { dataTypes, groups } = props
  const [view, setViewState] = useState<View>(readView)
  const [search, setSearch] = useState("")
  const [groupId, setGroupId] = useState("")
  const [drawer, setDrawer] = useState<{ mode: "create" } | { mode: "edit"; id: string } | null>(null)

  const setView = (next: View) => {
    setViewState(next)
    try { localStorage.setItem(VIEW_KEY, next) } catch { /* per-viewer convenience only */ }
  }

  // null = no filter active, so the canvas doesn't dim anything
  const matchIds = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query && !groupId) return null
    return new Set(
      dataTypes
        .filter((d) => !groupId || (groupId === "none" ? !d.groupId : d.groupId === groupId))
        .filter((d) => !query || [d.name, d.description ?? "", d.group?.name ?? "", d.shape.name].some((s) => s.toLowerCase().includes(query)))
        .map((d) => d.id),
    )
  }, [dataTypes, search, groupId])

  const editing = drawer?.mode === "edit" ? dataTypes.find((d) => d.id === drawer.id) ?? null : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="join">
          <button onClick={() => setView("canvas")} className={`btn btn-sm join-item ${view === "canvas" ? "btn-active" : ""}`}>
            <TbSchema className="size-4" /> Canvas
          </button>
          <button onClick={() => setView("list")} className={`btn btn-sm join-item ${view === "list" ? "btn-active" : ""}`}>
            <TbLayoutList className="size-4" /> List
          </button>
        </div>

        <label className="input input-sm w-64">
          <TbSearch className="size-4 opacity-50" />
          <input type="search" placeholder="Search data types" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search"><TbX className="size-4 opacity-50" /></button>
          )}
        </label>

        <select className="select select-sm w-48" value={groupId} onChange={(e) => setGroupId(e.target.value)} aria-label="Filter by group">
          <option value="">All groups</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          <option value="none">No group</option>
        </select>

        {matchIds && <span className="text-sm text-base-content/60">{matchIds.size} of {dataTypes.length}</span>}

        <button onClick={() => setDrawer({ mode: "create" })} className="btn btn-primary btn-sm ml-auto">
          <TbPlus className="size-4" /> Data Type
        </button>
      </div>

      {view === "canvas" ? (
        <DataTypeCanvas
          settings={props}
          matchIds={matchIds}
          selectedId={drawer?.mode === "edit" ? drawer.id : null}
          onOpen={(id) => setDrawer({ mode: "edit", id })}
          onClose={() => setDrawer(null)}
        />
      ) : (
        <DataTypeList settings={props} matchIds={matchIds} onOpen={(id) => setDrawer({ mode: "edit", id })} />
      )}

      {/* a just-created type shows once router.refresh brings it in */}
      {drawer && (drawer.mode === "create" || editing) && (
        <DataTypeDrawer
          key={drawer.mode === "edit" ? drawer.id : "create"}
          dataType={editing}
          settings={props}
          onClose={() => setDrawer(null)}
          onCreated={(id) => setDrawer({ mode: "edit", id })}
        />
      )}
    </div>
  )
}

export default DataTypesView
