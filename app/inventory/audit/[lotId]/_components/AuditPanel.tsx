"use client";
import React, { useState } from "react";
import { LotWithData } from "../_types/LotWithData";
import LotCard from "./LotCard";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";

type AuditPanelProps = {
  allLots: LotWithData[];
};

const AuditPanel = ({ allLots }: AuditPanelProps) => {
  const [isShowAll, setIsShowAll] = useState<boolean>(false);

  const filteredLots = allLots.filter((lot) => lot.totalQuantityOnHand !== 0);

  const total = allLots.reduce((prev, current) => prev + current.totalQuantityOnHand, 0);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex justify-between items-center">
        <button onClick={() => setIsShowAll(!isShowAll)} className="btn btn-neutral btn-soft">
          Show All
        </button>

        <span className="text-xl font-poppins font-bold">Total: {toFracitonalDigits.weight(total)} lbs</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isShowAll ? (
          allLots.map((lot: LotWithData) => (
            <LotCard key={lot.id} lot={lot} />
          ))
        ) : (
          filteredLots.map((lot: LotWithData) => (
            <LotCard key={lot.id} lot={lot} />
          ))
        )}
      </div>
    </div>
  );
};

export default AuditPanel;

