import PageTitle from "@/components/Text/PageTitle";
import { researchActions } from "@/actions/research";
import OverheadForm from "./_components/OverheadForm";
import BatchSizeManager from "./_components/BatchSizeManager";

const ResearchSettingsPage = async () => {
  const [settings, batchSizes] = await Promise.all([
    researchActions.costSettings.get(),
    researchActions.costBatchSizes.getAll(),
  ]);

  return (
    <div className="flex flex-col gap-y-8 p-6">
      <PageTitle>Research Cost Settings</PageTitle>
      <OverheadForm settings={settings} />
      <BatchSizeManager batchSizes={batchSizes} />
    </div>
  );
};

export default ResearchSettingsPage;
