"use client";
import { FiMenu } from "react-icons/fi";
import { useAppActions } from "@/store/appSlice";

// Mobile-only trigger for the off-canvas sidebar drawer. Hidden at md+ where the
// sidebar is always visible.
const MobileMenuButton = () => {
  const { toggleMobileSidebar } = useAppActions();

  return (
    <button
      type="button"
      aria-label="Open navigation menu"
      onClick={toggleMobileSidebar}
      className="btn btn-ghost btn-square md:hidden"
    >
      <FiMenu className="text-2xl" />
    </button>
  );
};

export default MobileMenuButton;
