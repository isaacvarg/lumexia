const Section = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="flex items-center gap-2 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
      <span className="h-px w-4 bg-accent/60" />
      {children}
    </h2>
  );
};

export default Section;
