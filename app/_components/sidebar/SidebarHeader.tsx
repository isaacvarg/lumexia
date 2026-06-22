import { TbLayoutSidebarLeftExpand, TbLayoutSidebarRightExpand } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useAppActions } from "@/store/appSlice";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarHeaderProps {
    isSidebarCollapsed: boolean;
}

const SidebarHeader = ({ isSidebarCollapsed }: SidebarHeaderProps) => {
    const router = useRouter();
    const { toggleSidebarCollapse } = useAppActions();

    return (
        <div className="flex flex-col px-4 pb-4 gap-y-1" >

            <div className="w-full flex justify-center items-center">
                <div
                    onClick={() => router.push("/")}
                    className="flex items-baseline hover:bg-base-200 px-2 rounded-xl hover:cursor-pointer"
                >
                    <h1 className="font-poppins text-4xl text-base-content tracking-wide font-bold leading-none">
                        L
                    </h1>
                    <AnimatePresence>
                        {!isSidebarCollapsed && (
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="font-poppins text-4xl text-base-content tracking-wide font-bold leading-none overflow-hidden whitespace-nowrap"
                            >
                                umexia
                            </motion.h1>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div
                className="hover:cursor-pointer btn btn-ghost flex items-center"
                onClick={toggleSidebarCollapse}
            >
                {!isSidebarCollapsed && <p className="text-xs">Collapse</p>}
                <span className="text-xl">
                    {isSidebarCollapsed ? <TbLayoutSidebarRightExpand /> : <TbLayoutSidebarLeftExpand />}
                </span>
            </div>

        </div>
    );
};

export default SidebarHeader;
