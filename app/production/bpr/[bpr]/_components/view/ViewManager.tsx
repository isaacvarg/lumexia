'use client'
import { useProductionSelection } from "@/store/productionSlice"
import Staging from "../staging/Staging"
import { useAppSelection } from "@/store/appSlice"
import Primary from "../quality/Primary"
import Secondary from "../quality/Secondary"
import Compounding from "../compounding/Compounding"
import ProgressOverview from "../overview/ProgressOverview"

// currently there isn't a need for separate components for
// primary and secondary verification, but they are being kept separate
// because it is likely quality control wants to change this in the future

export type BprViewStatus = 'staging' | 'primaryVerification' | 'secondaryVerification' | 'isCompounding';

const ViewManager = () => {

  const { viewStatuses, bpr } = useProductionSelection()
  const { user } = useAppSelection()

  // Whether the current user has an actionable view for the current stage.
  const canAct = Boolean(
    (user?.roles.isProduction && viewStatuses.isStaging) ||
    (user?.roles.isProductionQuality && viewStatuses.isPrimaryVerifcation) ||
    (user?.roles.isProductionQualitySecondary && viewStatuses.isSecondaryVerification) ||
    (user?.roles.isProduction && viewStatuses.isCompounding)
  )

  // Don't render the fallback until the store has hydrated and the stage is known.
  const isHydrated = Boolean(bpr)

  return (
    <div>

      {(user?.roles.isProduction && viewStatuses.isStaging) && <Staging />}

      {(user?.roles.isProductionQuality && viewStatuses.isPrimaryVerifcation) && <Primary />}

      {(user?.roles.isProductionQualitySecondary && viewStatuses.isSecondaryVerification) && <Secondary />}

      {(user?.roles.isProduction && viewStatuses.isCompounding) && <Compounding />}

      {(isHydrated && !canAct) && <ProgressOverview />}
    </div>
  )
}

export default ViewManager
