import { PurchasingRequest } from "@/actions/purchasing/requests/getByStatus"
import { create } from "zustand"

type State = {
  overallAlertCount: number | null
}

type Actions = {
  actions: {

  }
}

export const useAppQuerySelection = create<State & Actions>((set) => ({
  overallAlertCount: null,

  actions: {
  },



}))

export const useAppQueryActions = () => useAppQuerySelection((state) => state.actions)



