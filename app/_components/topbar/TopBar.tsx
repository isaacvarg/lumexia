import prisma from "@/lib/prisma";
import { getUserId } from "@/actions/users/getUserId";
import UserIcon from './UserIcon'
import ConfigurationStateSetter from "../state/ConfigurationStateSetter";
import AppQuery from "../state/AppQuery";
import AppStateSetter from "../state/AppStateSetter";
import ThemeChangerDialog from "@/components/Theme/ThemeChangerDialog";
import PageBreadcrumbs from "./PageBreadcrumbs";
import ThemeIcon from "@/components/Theme/ThemeIcon";
import { userConfigGroups } from "@/configs/staticRecords/userConfigGroups";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Motions from "./Motions";
import MobileMenuButton from "./MobileMenuButton";

const TopBar = async () => {


  const userId = await getUserId()
  const panelSelections = await prisma.userConfig.findMany({
    where: {
      userId,
      configGroupId: userConfigGroups.panelselections
    },
  });

  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <>
      <ConfigurationStateSetter panelSelections={panelSelections} />
      <AppQuery />
      <AppStateSetter />
      <ThemeChangerDialog />

      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-2 gap-y-2 bg-base-200 py-4  rounded-lg" >

        <MobileMenuButton />

        {/* Breadcrumbs drop to a full-width second row below md; inline (flex-1) at md+. */}
        <div className="order-last w-full overflow-x-auto md:order-none md:w-auto md:flex-1 min-w-0">
          <PageBreadcrumbs />
        </div>

        <div className="flex items-center gap-x-4 ml-auto md:ml-0">

          <Motions />
          <ThemeIcon />
          <UserIcon />

        </div>
      </div>


    </>
  );
};

export default TopBar;
