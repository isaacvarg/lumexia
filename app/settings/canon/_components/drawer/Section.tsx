import React from "react"

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-2 border-b border-base-300 py-4 first:pt-0">
    <h4 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">{title}</h4>
    {hint && <p className="text-xs text-base-content/60">{hint}</p>}
    {children}
  </section>
)

export default Section
