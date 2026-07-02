const Ordered = ({ children }: { children: React.ReactNode }) => {
  return (
    <ol className="flex flex-col gap-2.5 [counter-reset:step]">{children}</ol>
  );
};

export default Ordered;
