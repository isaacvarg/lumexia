const List = ({ children }: { children: React.ReactNode }) => {
  return <ul className="flex flex-col gap-2.5">{children}</ul>;
};

export default List;
