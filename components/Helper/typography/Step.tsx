const Step = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="relative pl-8 leading-relaxed text-base-content/90 [counter-increment:step] before:absolute before:left-0 before:top-[0.05em] before:flex before:h-5 before:w-5 before:items-center before:justify-center before:rounded-full before:bg-accent/15 before:text-[0.7rem] before:font-semibold before:text-accent before:content-[counter(step)]">
      {children}
    </li>
  );
};

export default Step;
