const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-5 text-base-content">{children}</div>
  );
};

export default Wrapper;
