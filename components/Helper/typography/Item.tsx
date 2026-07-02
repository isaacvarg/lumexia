const Item = ({
  term,
  children,
}: {
  term?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <li className="relative pl-5 leading-relaxed text-base-content/90 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70">
      {term && (
        <span className="font-semibold text-base-content">{term} — </span>
      )}
      {children}
    </li>
  );
};

export default Item;
