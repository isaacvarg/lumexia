const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-4 prose text-base-content">
      {children}
    </div>
  )
}

export default Wrapper
