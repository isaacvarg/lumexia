import PageBreadcrumbs from "@/components/App/PageBreadcrumbs";

const ResearchSettingsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <PageBreadcrumbs />
      {children}
    </div>
  );
};

export default ResearchSettingsLayout;
