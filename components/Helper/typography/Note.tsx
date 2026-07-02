const Note = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-lg border-l-2 border-accent/70 bg-base-200/60 px-4 py-3 text-sm leading-relaxed text-base-content/80">
      {children}
    </div>
  );
};

export default Note;
