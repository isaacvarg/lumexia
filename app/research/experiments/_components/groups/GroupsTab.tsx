"use client";

import { useMemo, useState } from "react";
import { ExperimentGroupWithExperiments } from "@/actions/research/getExperimentGroupsWithExperiments";
import GroupSection from "./GroupSection";

type Props = {
  groups: ExperimentGroupWithExperiments[];
};

const GroupsTab = ({ groups }: Props) => {
  // null = "All" statuses
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);

  // Only offer statuses that groups actually use, in status sequence order.
  const presentStatuses = useMemo(() => {
    const byId = new Map<string, ExperimentGroupWithExperiments["status"]>();
    groups.forEach((group) => byId.set(group.status.id, group.status));
    return Array.from(byId.values()).sort((a, b) => a.sequence - b.sequence);
  }, [groups]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    groups.forEach((group) => {
      counts.set(group.status.id, (counts.get(group.status.id) ?? 0) + 1);
    });
    return counts;
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (!selectedStatusId) return groups;
    return groups.filter((group) => group.status.id === selectedStatusId);
  }, [groups, selectedStatusId]);

  return (
    <div className="flex flex-col gap-y-6 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          className={`btn-lg btn ${
            !selectedStatusId ? "btn-secondary" : "btn-soft"
          } flex w-full justify-between`}
          onClick={() => setSelectedStatusId(null)}
        >
          <span>All</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-xs font-semibold text-info-content">
            {groups.length}
          </div>
        </button>
        {presentStatuses.map((status) => (
          <button
            key={status.id}
            className={`btn-lg btn ${
              selectedStatusId === status.id ? "btn-secondary" : "btn-soft"
            } flex w-full justify-between`}
            onClick={() => setSelectedStatusId(status.id)}
          >
            <span>{status.name}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-xs font-semibold text-info-content">
              {statusCounts.get(status.id) ?? 0}
            </div>
          </button>
        ))}
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-base-content/60 py-8 text-center">
          No experiment groups to show.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredGroups.map((group) => (
            <GroupSection key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsTab;
