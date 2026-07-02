import PageTitle from "@/components/Text/PageTitle";
import { researchActions } from "@/actions/research";
import OverheadForm from "./_components/OverheadForm";
import BatchSizeManager from "./_components/BatchSizeManager";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";

const ResearchSettingsPage = async () => {
  const [settings, batchSizes] = await Promise.all([
    researchActions.costSettings.get(),
    researchActions.costBatchSizes.getAll(),
  ]);

  return (
    <div className="flex flex-col gap-y-6">
      <PageTitle>Research Settings</PageTitle>
      <TabSelector />
      <TabsContainer
        overhead={<OverheadForm settings={settings} />}
        batchSizes={<BatchSizeManager batchSizes={batchSizes} />}
      />
    </div>
  );
};

export default ResearchSettingsPage;
