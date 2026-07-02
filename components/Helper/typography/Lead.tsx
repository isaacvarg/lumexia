const Lead = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-lg leading-relaxed text-base-content/90">{children}</p>
  );
};

export default Lead;
